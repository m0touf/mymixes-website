import { useState, useEffect } from "react";
import { createRecipe, updateRecipe, fetchRecipe, deleteRecipe, type Recipe } from "./services/api";
import { useAuth } from "./hooks/useAuth";
import { useRecipes } from "./hooks/useRecipes";
import { TopBar, LoginCard, LandingPage, HomeGrid, GuestGrid, RecipeDetail, RecipeForm, ReviewPage, QrManager } from "./components";
import type { Page, RecipeFormData } from "./types";

// ---- Main App ----
export default function App() {
  const { isAdmin, handleLogout, handleLogin: authHandleLogin } = useAuth();
  const [page, setPage] = useState<Page>({ name: "landing" });
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipeCache, setRecipeCache] = useState<Map<number, Recipe>>(new Map());

  // Use the recipes hook for fetching data
  const { recipes, setRecipes, loading: recipesLoading } = useRecipes(
    search, 
    page.name === "home" || page.name === "guest" || page.name === "landing"
  );

  // Handle URL hash routing for QR code access
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/review/')) {
      const match = hash.match(/#\/review\/(\d+)/);
      if (match) {
        const recipeId = parseInt(match[1]);
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          setCurrentRecipe(recipe);
          setPage({ name: "review", id: recipeId });
        }
      }
    }
  }, [recipes]);

  // Extract token from URL query parameters (including hash fragments)
  const getUrlToken = () => {
    // First try to get from hash fragment (e.g., /#/review/9?token=...)
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const hashParams = new URLSearchParams(hash.split('?')[1]);
      const token = hashParams.get('token');
      if (token) return token;
    }
    
    // Fallback to regular query parameters
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  };

  const goLanding = () => {
    // Logout when going back to landing page
    handleLogout();
    setPage({ name: "landing" });
  };
  const goHome = () => {
    setPage({ name: "home" });
  };
  
  const goGuest = () => {
    // Logout when switching to guest mode
    handleLogout();
    setPage({ name: "guest" });
  };
  const goCreate = () => setPage({ name: "create" });
  const goQrManager = () => setPage({ name: "qr-manager" });
  
  const goDetail = async (id: number) => {
    // Check if we already have the full recipe data cached
    const cachedRecipe = recipeCache.get(id);
    if (cachedRecipe) {
      setCurrentRecipe(cachedRecipe);
      setPage({ name: "detail", id });
      return;
    }

    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      try {
        setLoading(true);
        setError(null);
        // Fetch the full recipe details with ingredients and reviews
        const fullRecipe = await fetchRecipe(recipe.slug);
        setCurrentRecipe(fullRecipe);
        // Cache the full recipe data
        setRecipeCache(prev => new Map(prev).set(id, fullRecipe));
        setPage({ name: "detail", id });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const goEdit = async (id: number) => {
    // Check cache first
    const cachedRecipe = recipeCache.get(id);
    if (cachedRecipe) {
      setCurrentRecipe(cachedRecipe);
      setPage({ name: "edit", id });
      return;
    }

    // If we have a currentRecipe with ingredients, use it
    if (currentRecipe && currentRecipe.ingredients && currentRecipe.ingredients.length > 0) {
      setPage({ name: "edit", id });
      return;
    }
    
    // Otherwise, fetch the full recipe data
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      try {
        setLoading(true);
        setError(null);
        const fullRecipe = await fetchRecipe(recipe.slug);
        setCurrentRecipe(fullRecipe);
        // Cache the full recipe data
        setRecipeCache(prev => new Map(prev).set(id, fullRecipe));
        setPage({ name: "edit", id });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe for editing');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!currentRecipe) return;
    
    try {
      setLoading(true);
      await deleteRecipe(currentRecipe.id);
      // Remove from local recipes list
      setRecipes(recipes.filter(r => r.id !== currentRecipe.id));
      // Remove from cache
      setRecipeCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(currentRecipe.id);
        return newCache;
      });
      // Go back to home
      await goHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    } finally {
      setLoading(false);
    }
  };

  // --- Auth ---
  const handleLogin = async (pwd: string) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous error before attempting login
      await authHandleLogin(pwd);
      await goHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  // --- Recipe handlers ---
  const handleCreateRecipe = async (data: RecipeFormData) => {
    try {
      setLoading(true);
      const newRecipe = await createRecipe(data);
      setRecipes([newRecipe, ...recipes]);
      await goHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecipe = async (data: RecipeFormData) => {
    if (page.name !== "edit") return;
    
    try {
      setLoading(true);
      setError(null);
      const updatedRecipe = await updateRecipe(page.id, data);
      setRecipes(recipes.map((r) => (r.id === page.id ? updatedRecipe : r)));
      setCurrentRecipe(updatedRecipe);
      // Navigate to detail page using the updated recipe's slug
      setPage({ name: "detail", id: updatedRecipe.id });
      // Fetch the full recipe details with ingredients and reviews using the updated slug
      const fullRecipe = await fetchRecipe(updatedRecipe.slug);
      setCurrentRecipe(fullRecipe);
      // Update the cache with the new full recipe data
      setRecipeCache(prev => new Map(prev).set(updatedRecipe.id, fullRecipe));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Loading Overlay */}
      {(loading || recipesLoading) && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
              <span className="text-lg font-medium text-gray-100">
                Loading...
              </span>
            </div>
          </div>
        </div>
      )}
      
      <TopBar 
        onLogoClick={goLanding}
        isAdmin={isAdmin}
        onQrManager={goQrManager}
        currentPage={page}
      />
      
      <main className="mx-auto max-w-6xl px-4 py-6">
        {page.name === "landing" && (
          <LandingPage 
            onAdminLogin={() => setPage({ name: "login" })}
            onGuestAccess={() => goGuest()}
            cocktails={recipes}
          />
        )}
        
        {page.name === "login" && (
          <LoginCard onSubmit={handleLogin} loading={loading} error={error} />
        )}
        
        {page.name === "home" && (
          <HomeGrid
            isAdmin={isAdmin}
            recipes={recipes}
            search={search}
            setSearch={setSearch}
            onCreate={goCreate}
            onOpen={goDetail}
            loading={loading}
            error={error}
          />
        )}
        
        {page.name === "guest" && (
          <GuestGrid
            recipes={recipes}
            search={search}
            setSearch={setSearch}
            onOpen={goDetail}
            loading={loading}
            error={error}
          />
        )}
        
        {page.name === "detail" && currentRecipe && (
          <RecipeDetail
            isAdmin={isAdmin}
            recipe={currentRecipe}
            onBack={isAdmin ? () => goHome() : () => goGuest()}
            onEdit={() => goEdit(page.id)}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        )}
        
        {page.name === "create" && (
          <RecipeForm
            mode="create"
            onCancel={() => goHome()}
            onSubmit={handleCreateRecipe}
          />
        )}
        
        {page.name === "edit" && currentRecipe && (
          <RecipeForm
            mode="edit"
            initial={currentRecipe}
            onCancel={() => goDetail(page.id)}
            onSubmit={handleUpdateRecipe}
          />
        )}

        {page.name === "review" && currentRecipe && (
          <ReviewPage
            recipe={currentRecipe}
            token={getUrlToken() || undefined}
            onBack={() => {
              // Clear the URL hash and go to landing page
              window.location.hash = "";
              setPage({ name: "landing" });
            }}
          />
        )}

        {page.name === "qr-manager" && (
          <QrManager
            recipes={recipes}
            onBack={() => goHome()}
          />
        )}
      </main>
    </div>
  );
}