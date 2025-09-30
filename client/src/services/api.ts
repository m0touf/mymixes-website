// Dynamic API configuration
const getApiBase = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // Development: use localhost or custom URL
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  } else {
    // Production: use environment variable or fallback
    return import.meta.env.VITE_API_URL || 'https://mymixes-website-production-5e7e.up.railway.app';
  }
};

const API_BASE = getApiBase();

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API_BASE:', API_BASE);
}

// Auth token management
const getAuthToken = () => localStorage.getItem('authToken');
const setAuthToken = (token: string) => localStorage.setItem('authToken', token);
const removeAuthToken = () => localStorage.removeItem('authToken');

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface Review {
  id: string;
  rating: number;
  comment: string;
  name?: string;
  recipeId: number;
  userId?: number;
  createdAt: string;
}

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  method: string;
  ingredients: ServerIngredient[];
  reviews?: Review[];
  avgRating?: number;
  createdAt: string;
  updatedAt: string;
  // For list view - count instead of full data
  _count?: {
    ingredients: number;
    reviews: number;
  };
}

// Server-side Ingredient interface (different from client-side form Ingredient)
export interface ServerIngredient {
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
  slug: string;
  imageUrl?: string;
  description?: string;
  method: string;
  ingredients: {
    name: string;
    amount: string;
    typeId?: number;
  }[];
}


export async function fetchRecipes(query?: string, page = 1, size = 12): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  params.append('page', page.toString());
  params.append('size', size.toString());

  const response = await fetch(`${API_BASE}/recipes?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch recipes: ${response.statusText}`);
  }
  const data = await response.json();
  return data.items || data;
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
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      throw new Error('Authentication required');
    }
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to create recipe: ${response.statusText}`);
  }
  return response.json();
}

export async function updateRecipe(id: number, data: CreateRecipeData): Promise<Recipe> {
  const response = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      throw new Error('Authentication required');
    }
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to update recipe: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteRecipe(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      throw new Error('Authentication required');
    }
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to delete recipe: ${response.statusText}`);
  }
}

// Authentication functions
export interface LoginResponse {
  token: string;
  user: {
    role: string;
  };
}

export async function login(password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Login failed');
  }

  const data = await response.json();
  setAuthToken(data.token);
  return data;
}

export async function verifyToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      removeAuthToken();
      return false;
    }

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    removeAuthToken();
    return false;
  }
}

export function logout(): void {
  removeAuthToken();
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
