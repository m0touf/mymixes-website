const API_BASE = 'http://localhost:4000';

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  method: string;
  ingredients: Ingredient[];
  avgRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: string;
  recipeId: number;
  typeId: number;
  type: {
    id: number;
    name: string;
  };
}

export interface CreateRecipeData {
  title: string;
  imageUrl?: string;
  description?: string;
  method: string;
  ingredients: {
    name: string;
    amount: string;
    typeId?: number;
  }[];
}

export interface RecipesResponse {
  items: Recipe[];
  total: number;
  page: number;
  size: number;
}

export async function fetchRecipes(query?: string, page = 1, size = 12): Promise<RecipesResponse> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await fetch(`${API_BASE}/recipes?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch recipes: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchRecipe(slug: string): Promise<Recipe> {
  const response = await fetch(`${API_BASE}/recipes/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch recipe: ${response.statusText}`);
  }
  return response.json();
}

export async function createRecipe(data: CreateRecipeData): Promise<Recipe> {
  const response = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create recipe: ${response.statusText}`);
  }
  return response.json();
}
