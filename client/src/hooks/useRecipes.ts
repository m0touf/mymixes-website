import { useState, useEffect } from "react";
import { fetchRecipes, type Recipe } from "../services/api";

export const useRecipes = (search: string, enabled: boolean = true) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes(search);
      setRecipes(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [search, enabled]);

  return {
    recipes,
    setRecipes,
    loading,
    error,
    setError,
    refetch: loadRecipes,
  };
};
