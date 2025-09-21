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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use the recipes hook for fetching data
  const { recipes, setRecipes, loading: recipesLoading, error: recipesError } = useRecipes(
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

  // Update loading and error states from recipes hook
  useEffect(() => {
    setLoading(recipesLoading);
    setError(recipesError);
  }, [recipesLoading, recipesError]);

  // --- Navigation helpers ---
  const goLanding = () => {
    // Logout when going back to landing page
    handleLogout();
    setPage({ name: "landing" });
  };
  const goHome = async () => {
    setIsTransitioning(true);
    // Wait for recipes to load if they're not already loaded
    if (recipes.length === 0 && !recipesLoading) {
      // Give a moment for the recipes to start loading
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setPage({ name: "home" });
    setIsTransitioning(false);
  };
  
  const goGuest = async () => {
    setIsTransitioning(true);
    // Logout when switching to guest mode
    handleLogout();
    // Wait for recipes to load if they're not already loaded
    if (recipes.length === 0 && !recipesLoading) {
      // Give a moment for the recipes to start loading
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setPage({ name: "guest" });
    setIsTransitioning(false);
  };
  const goCreate = () => setPage({ name: "create" });
  const goQrManager = () => setPage({ name: "qr-manager" });
  
  const goDetail = async (id: number) => {
    setIsTransitioning(true);
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      try {
        setLoading(true);
        // Fetch the full recipe details with ingredients and reviews
        const fullRecipe = await fetchRecipe(recipe.slug);
        setCurrentRecipe(fullRecipe);
        setPage({ name: "detail", id });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe details');
      } finally {
        setLoading(false);
        setIsTransitioning(false);
      }
    } else {
      setIsTransitioning(false);
    }
  };
  
  const goEdit = async (id: number) => {
    // If we have a currentRecipe with ingredients, use it
    if (currentRecipe && currentRecipe.ingredients && currentRecipe.ingredients.length > 0) {
      setCurrentRecipe(currentRecipe);
      setPage({ name: "edit", id });
      return;
    }
    
    // Otherwise, fetch the full recipe data
    try {
      setLoading(true);
      const recipe = recipes.find((r) => r.id === id);
      if (recipe) {
        const fullRecipe = await fetchRecipe(recipe.slug);
        setCurrentRecipe(fullRecipe);
        setPage({ name: "edit", id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRecipe) return;
    
    try {
      setLoading(true);
      await deleteRecipe(currentRecipe.id);
      // Remove from local recipes list
      setRecipes(recipes.filter(r => r.id !== currentRecipe.id));
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
      console.log('Updating recipe with data:', data);
      const updatedRecipe = await updateRecipe(page.id, data);
      console.log('Updated recipe received:', updatedRecipe);
      setRecipes((prev) =>
        prev.map((r) => (r.id === page.id ? updatedRecipe : r))
      );
      setCurrentRecipe(updatedRecipe);
      // Navigate to detail page using the updated recipe's slug
      setPage({ name: "detail", id: updatedRecipe.id });
      setIsTransitioning(true);
      try {
        setLoading(true);
        // Fetch the full recipe details with ingredients and reviews using the updated slug
        const fullRecipe = await fetchRecipe(updatedRecipe.slug);
        setCurrentRecipe(fullRecipe);
      } catch (err) {
        console.error('Error fetching updated recipe:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch updated recipe');
      } finally {
        setLoading(false);
        setIsTransitioning(false);
      }
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Loading Overlay */}
      {(loading || isTransitioning || recipesLoading) && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
              <span className="text-lg font-medium text-gray-100">
                {isTransitioning ? "Loading page..." : "Loading recipes..."}
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