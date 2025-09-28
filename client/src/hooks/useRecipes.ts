import { useState, useEffect, useRef, useMemo } from "react";
import { fetchRecipes, type Recipe } from "../services/api";

export const useRecipes = (search: string, enabled: boolean = true) => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);

  // Load all recipes once on initial load
  useEffect(() => {
    if (!enabled || hasInitiallyLoaded.current) return;
    
    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecipes(); // Load all recipes without search
        setAllRecipes(data);
        hasInitiallyLoaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [enabled]);

  // Filter recipes based on search term (instant client-side filtering)
  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return allRecipes;
    
    const searchTerm = search.toLowerCase().trim();
    return allRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.description?.toLowerCase().includes(searchTerm) ||
      recipe.method.toLowerCase().includes(searchTerm) ||
      recipe.ingredients?.some(ingredient => 
        ingredient.name.toLowerCase().includes(searchTerm) ||
        ingredient.amount.toLowerCase().includes(searchTerm)
      )
    );
  }, [allRecipes, search]);

  const setRecipes = (recipes: Recipe[]) => {
    setAllRecipes(recipes);
  };

  const refetch = async () => {
    hasInitiallyLoaded.current = false;
    setAllRecipes([]);
    // Trigger the useEffect to reload
    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecipes();
        setAllRecipes(data);
        hasInitiallyLoaded.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };
    await loadRecipes();
  };

  return {
    recipes: filteredRecipes,
    setRecipes,
    loading,
    error,
    setError,
    refetch,
  };
};
