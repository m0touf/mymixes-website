import { useMemo, useState, useEffect } from "react";
import { fetchRecipes, createRecipe, updateRecipe, login, verifyToken, logout, isAuthenticated, type Recipe } from "./services/api";

// ---- Simple in-file mock router ----
type Page =
  | { name: "login" }
  | { name: "home" }
  | { name: "create" }
  | { name: "detail"; id: number }
  | { name: "edit"; id: number };

// ---- Types ----
type Ingredient = { id: string; name: string; amount: string };

// ---- Helpers ----
const uid = () => Math.random().toString(36).slice(2, 10);

// Sample recipes removed - now fetching from API

// ---- Main App ----
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState<Page>({ name: "login" });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipes on component mount and when search changes
  useEffect(() => {
    const loadRecipes = async () => {
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

    if (page.name === "home") {
      loadRecipes();
    }
  }, [page.name, search]);

  const filtered = useMemo(() => {
    // Since we're now fetching with search query, just return recipes directly
    return recipes;
  }, [recipes]);

  // --- Navigation helpers ---
  const goHome = () => setPage({ name: "home" });
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
      await login(pwd);
      setIsAdmin(true);
      goHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAdmin(false);
    setPage({ name: "login" });
  };

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const isValid = await verifyToken();
          if (isValid) {
            setIsAdmin(true);
            setPage({ name: "home" });
          } else {
            setIsAdmin(false);
            setPage({ name: "login" });
          }
        } catch (err) {
          setIsAdmin(false);
          setPage({ name: "login" });
        }
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <TopBar onLogoClick={goHome} isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {page.name === "login" && <LoginCard onSubmit={handleLogin} loading={loading} error={error} />}
        {page.name === "home" && (
          <HomeGrid
            isAdmin={isAdmin}
            recipes={filtered}
            search={search}
            setSearch={setSearch}
            onCreate={goCreate}
            onOpen={(id) => goDetail(id)}
            loading={loading}
            error={error}
          />
        )}
        {page.name === "detail" && currentRecipe && (
          <RecipeDetail
            isAdmin={isAdmin}
            recipe={currentRecipe}
            onBack={goHome}
            onEdit={() => goEdit(page.id)}
          />
        )}
        {page.name === "create" && (
          <RecipeForm
            mode="create"
            onCancel={goHome}
            onSubmit={async (data) => {
              try {
                setLoading(true);
                const recipeData = {
                  ...data,
                  slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                };
                const newRecipe = await createRecipe(recipeData);
                setRecipes([newRecipe, ...recipes]);
                goHome();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create recipe');
              } finally {
                setLoading(false);
              }
            }}
          />
        )}
        {page.name === "edit" && currentRecipe && (
          <RecipeForm
            mode="edit"
            initial={currentRecipe}
            onCancel={() => goDetail(page.id)}
            onSubmit={async (data) => {
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
            }}
          />
        )}
      </main>
    </div>
  );
}

// ---- UI Components ----
function TopBar({
  onLogoClick,
  isAdmin,
  onLogout,
}: {
  onLogoClick: () => void;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button onClick={onLogoClick} className="text-xl font-bold tracking-tight">
          my<span className="text-pink-600">mixes</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {isAdmin ? "Admin mode" : "Viewer"}
          </div>
          {isAdmin && (
            <button
              onClick={onLogout}
              className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function LoginCard({ onSubmit, loading, error }: { 
  onSubmit: (pwd: string) => void; 
  loading: boolean; 
  error: string | null;
}) {
  const [pwd, setPwd] = useState("");
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold">Admin Login</h1>
      <p className="mb-6 text-sm text-gray-400">
        Enter password to manage recipes.
      </p>
      {error && (
        <div className="mb-4 rounded-lg border border-red-600 bg-red-900/20 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={() => onSubmit(pwd)}
          disabled={loading || !pwd.trim()}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
            loading || !pwd.trim()
              ? "cursor-not-allowed bg-gray-600"
              : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

function HomeGrid({
  isAdmin,
  recipes,
  search,
  setSearch,
  onCreate,
  onOpen,
  loading,
  error,
}: {
  isAdmin: boolean;
  recipes: Recipe[];
  search: string;
  setSearch: (s: string) => void;
  onCreate: () => void;
  onOpen: (id: number) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cocktails or ingredients…"
            className="w-full rounded-2xl border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {isAdmin && (
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-700"
          >
            <span className="text-lg">+</span>
            New Recipe
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-600 bg-red-900/20 p-6 text-center">
          <p className="text-red-400">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-400">Loading recipes...</div>
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState isAdmin={isAdmin} onCreate={onCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <article
              key={r.id}
              className="group overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-sm transition hover:shadow-md hover:border-gray-600"
            >
              <button onClick={() => onOpen(r.id)} className="block w-full text-left">
                <div className="aspect-video w-full overflow-hidden bg-gray-700">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {r.description || r.method}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {r.ingredients.length} ingredients
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ isAdmin, onCreate }: { isAdmin: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-600 bg-gray-800 py-16 text-center">
      <p className="mb-4 text-gray-400">No cocktails yet.</p>
      {isAdmin && (
        <button
          onClick={onCreate}
          className="rounded-2xl bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
        >
          + Create your first recipe
        </button>
      )}
    </div>
  );
}

function RecipeDetail({
  isAdmin,
  recipe,
  onBack,
  onEdit,
}: {
  isAdmin: boolean;
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <button onClick={onBack} className="mb-4 text-sm text-gray-400 hover:underline">
          ← Back
        </button>
        <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-sm">
          {recipe.imageUrl && (
            <img src={recipe.imageUrl} alt={recipe.title} className="aspect-video w-full object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold">{recipe.title}</h1>
              {isAdmin && (
                <button
                  onClick={onEdit}
                  className="rounded-xl border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Edit
                </button>
              )}
            </div>
            {recipe.description && (
              <p className="mt-2 text-gray-400">{recipe.description}</p>
            )}

            <h2 className="mt-6 text-lg font-semibold">Ingredients</h2>
            <ul className="mt-3 space-y-2 pl-4">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-center text-base text-gray-300">
                  <span className="mr-3 text-lg">•</span>
                  <span className="font-medium">{ing.name}</span>
                  <span className="ml-2 text-gray-400">{ing.amount}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-lg font-semibold">How to make</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {recipe.method}
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
          <div className="text-sm text-gray-400">Slug</div>
          <div className="text-sm font-mono text-gray-300">/{recipe.slug}</div>
        </div>
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
          <div className="text-sm text-gray-400">Average rating</div>
          <div className="text-lg font-semibold text-gray-200">{recipe.avgRating ?? "—"}</div>
        </div>
      </aside>
    </div>
  );
}

function RecipeForm({
  mode,
  initial,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Recipe;
  onCancel: () => void;
  onSubmit: (data: {
    title: string;
    slug: string;
    imageUrl?: string;
    description?: string;
    method: string;
    ingredients: { id?: string; name: string; amount: string }[];
  }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [method, setMethod] = useState(initial?.method ?? "");
  const [ingredients, setIngredients] = useState<{ id: string; name: string; amount: string }[]>(
    initial?.ingredients
      ? initial.ingredients.map((ing) => ({
          id: typeof ing.id === "string" ? ing.id : String(ing.id),
          name: ing.type?.name || "",
          amount: ing.amount,
        }))
      : [{ id: uid(), name: "", amount: "" }]
  );

  const addRow = () =>
    setIngredients((prev) => [...prev, { id: uid(), name: "", amount: "" }]);
  const removeRow = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  const updateRow = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const disabled =
    !title.trim() ||
    !method.trim() ||
    ingredients.some((i) => !i.name.trim() || !i.amount.trim());

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onCancel} className="text-sm text-gray-400 hover:underline">
          ← {mode === "create" ? "Cancel" : "Back"}
        </button>
        <h1 className="text-xl font-semibold">
          {mode === "create" ? "Create Recipe" : "Edit Recipe"}
        </h1>
        <div />
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-400">Title</span>
            <input
              className="w-full rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Whiskey Sour"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-400">Image URL</span>
            <input
              className="w-full rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-400">Short description (optional)</span>
          <input
            className="w-full rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A quick blurb for the card"
          />
        </label>

        <div>
          <div className="mb-2 text-sm font-medium">Ingredients</div>
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <div key={ing.id} className="grid grid-cols-12 items-center gap-2">
                <input
                  className="col-span-6 rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Ingredient (e.g., Lime juice)"
                  value={ing.name}
                  onChange={(e) => updateRow(ing.id, { name: e.target.value })}
                />
                <input
                  className="col-span-4 rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Amount (e.g., 1 oz)"
                  value={ing.amount}
                  onChange={(e) => updateRow(ing.id, { amount: e.target.value })}
                />
                <button
                  onClick={() => removeRow(ing.id)}
                  className="col-span-2 rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mt-3 rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            + Add ingredient
          </button>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-400">How to make</span>
          <textarea
            className="h-40 w-full resize-y rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Steps, techniques, notes…"
          />
        </label>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                imageUrl: imageUrl.trim() || undefined,
                description: description.trim() || undefined,
                method: method.trim(),
                ingredients: ingredients.map((i) => ({
                  name: i.name.trim(),
                  amount: i.amount.trim(),
                })),
              })
            }
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
              disabled ? "cursor-not-allowed bg-neutral-300" : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {mode === "create" ? "Create" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
