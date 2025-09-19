import { useState, useEffect } from "react";
import { createRecipe, updateRecipe, fetchRecipe, type Recipe } from "./services/api";
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
  const goHome = () => setPage({ name: "home" });
  const goGuest = () => {
    // Logout when switching to guest mode
    handleLogout();
    setPage({ name: "guest" });
  };
  const goCreate = () => setPage({ name: "create" });
  const goQrManager = () => setPage({ name: "qr-manager" });
  
  const goDetail = async (id: number) => {
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
      }
    }
  };
  
  const goEdit = (id: number) => {
    const recipe = recipes.find((r) => r.id === id) || currentRecipe;
    if (recipe) {
      setCurrentRecipe(recipe);
      setPage({ name: "edit", id });
    }
  };

  // --- Auth ---
  const handleLogin = async (pwd: string) => {
    try {
      setLoading(true);
      await authHandleLogin(pwd);
      setPage({ name: "home" });
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
      goHome();
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
      goDetail(page.id);
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <TopBar 
        onLogoClick={goLanding} 
        isAdmin={isAdmin} 
      />
      
      <main className="mx-auto max-w-6xl px-4 py-6">
        {page.name === "landing" && (
          <LandingPage 
            onAdminLogin={() => setPage({ name: "login" })}
            onGuestAccess={goGuest}
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
            onQrManager={goQrManager}
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
            onBack={isAdmin ? goHome : goGuest}
            onEdit={() => goEdit(page.id)}
          />
        )}
        
        {page.name === "create" && (
          <RecipeForm
            mode="create"
            onCancel={goHome}
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
            onBack={goHome}
          />
        )}
      </main>
    </div>
  );
}