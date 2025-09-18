import { useState, useEffect } from "react";
import { createRecipe, updateRecipe, type Recipe } from "./services/api";
import { useAuth } from "./hooks/useAuth";
import { useRecipes } from "./hooks/useRecipes";
import { TopBar, LoginCard, HomeGrid, GuestGrid, RecipeDetail, RecipeForm } from "./components";
import type { Page, RecipeFormData } from "./types";

// ---- Main App ----
export default function App() {
  const { isAdmin, handleLogout, handleLogin: authHandleLogin } = useAuth();
  const [page, setPage] = useState<Page>({ name: "guest" });
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the recipes hook for fetching data
  const { recipes, setRecipes, loading: recipesLoading, error: recipesError } = useRecipes(
    search, 
    page.name === "home" || page.name === "guest"
  );

  // Update loading and error states from recipes hook
  useEffect(() => {
    setLoading(recipesLoading);
    setError(recipesError);
  }, [recipesLoading, recipesError]);

  // --- Navigation helpers ---
  const goHome = () => setPage({ name: "home" });
  const goGuest = () => setPage({ name: "guest" });
  const goCreate = () => setPage({ name: "create" });
  
  const goDetail = (id: number) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setCurrentRecipe(recipe);
      setPage({ name: "detail", id });
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

  const handleLogoutWithRedirect = () => {
    handleLogout();
    setPage({ name: "guest" });
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
        onLogoClick={isAdmin ? goHome : goGuest} 
        isAdmin={isAdmin} 
        onLogout={handleLogoutWithRedirect} 
        onLogin={() => setPage({ name: "login" })} 
      />
      
      <main className="mx-auto max-w-6xl px-4 py-6">
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
      </main>
    </div>
  );
}