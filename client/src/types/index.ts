// ---- Page Types ----
export type Page =
  | { name: "landing" }
  | { name: "login" }
  | { name: "home" }
  | { name: "guest" }
  | { name: "create" }
  | { name: "detail"; id: number }
  | { name: "edit"; id: number }
  | { name: "review"; id: number }
  | { name: "qr-manager" };

// ---- Component Types ----
export type Ingredient = { 
  id: string; 
  name: string; 
  amount: string; 
};

// ---- Form Types ----
export type RecipeFormData = {
  title: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  method: string;
  ingredients: { id?: string; name: string; amount: string }[];
};

// ---- Props Types ----
export interface TopBarProps {
  onLogoClick: () => void;
  isAdmin: boolean;
  onQrManager?: () => void;
  currentPage?: Page;
}

export interface LoginCardProps {
  onSubmit: (pwd: string) => void;
  loading: boolean;
  error: string | null;
}

export interface HomeGridProps {
  isAdmin: boolean;
  recipes: import("../services/api").Recipe[];
  search: string;
  setSearch: (s: string) => void;
  onCreate: () => void;
  onOpen: (id: number) => void;
  loading: boolean;
  error: string | null;
}

export interface GuestGridProps {
  recipes: import("../services/api").Recipe[];
  search: string;
  setSearch: (s: string) => void;
  onOpen: (id: number) => void;
  loading: boolean;
  error: string | null;
}

export interface RecipeDetailProps {
  isAdmin: boolean;
  recipe: import("../services/api").Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export interface RecipeFormProps {
  mode: "create" | "edit";
  initial?: import("../services/api").Recipe;
  onCancel: () => void;
  onSubmit: (data: RecipeFormData) => void;
}

export interface EmptyStateProps {
  isAdmin: boolean;
  onCreate: () => void;
}

export interface LandingPageProps {
  onAdminLogin: () => void;
  onGuestAccess: () => void;
  cocktails: import("../services/api").Recipe[];
}
