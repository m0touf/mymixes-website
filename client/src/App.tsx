import { useMemo, useState, useEffect } from "react";
import { fetchRecipes, createRecipe, type Recipe } from "./services/api";

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
  const goDetail = (id: number) => setPage({ name: "detail", id });
  const goEdit = (id: number) => setPage({ name: "edit", id });

  // --- Auth mock ---
  const handleLogin = (pwd: string) => {
    if (pwd === "admin") {
      setIsAdmin(true);
      goHome();
    } else {
      alert("Wrong password. Try 'admin'.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <TopBar onLogoClick={goHome} isAdmin={isAdmin} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {page.name === "login" && <LoginCard onSubmit={handleLogin} />}
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
        {page.name === "detail" && (
          <RecipeDetail
            isAdmin={isAdmin}
            recipe={recipes.find((r) => r.id === page.id)!}
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
                const newRecipe = await createRecipe(data);
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
        {page.name === "edit" && (
          <RecipeForm
            mode="edit"
            initial={recipes.find((r) => r.id === page.id)!}
            onCancel={() => goDetail(page.id)}
            onSubmit={(data) => {
              setRecipes((prev) =>
                prev.map((r) =>
                  r.id === page.id
                    ? {
                        ...r,
                        title: data.title,
                        imageUrl: data.imageUrl,
                        description: data.description,
                        method: data.method,
                        ingredients: data.ingredients.map((i) => ({
                          id: (i as any).id || uid(),
                          name: i.name,
                          amount: i.amount,
                          recipeId: r.id,
                          typeId: (i as any).typeId ?? undefined,
                          type: (i as any).type ?? undefined,
                        })),
                      }
                    : r
                ) as typeof prev
              );
              goDetail(page.id);
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
}: {
  onLogoClick: () => void;
  isAdmin: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button onClick={onLogoClick} className="text-xl font-bold tracking-tight">
          my<span className="text-pink-600">mixes</span>
        </button>
        <div className="text-sm text-neutral-500">
          {isAdmin ? "Admin mode" : "Viewer"}
        </div>
      </div>
    </header>
  );
}

function LoginCard({ onSubmit }: { onSubmit: (pwd: string) => void }) {
  const [pwd, setPwd] = useState("");
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold">Admin Login</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Enter password to manage recipes. (Try <code>admin</code>)
      </p>
      <div className="flex gap-2">
        <input
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={() => onSubmit(pwd)}
          className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
        >
          Login
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
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-neutral-500">Loading recipes...</div>
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState isAdmin={isAdmin} onCreate={onCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <article
              key={r.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <button onClick={() => onOpen(r.id)} className="block w-full text-left">
                <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                    {r.description || r.method}
                  </p>
                  <div className="mt-3 text-xs text-neutral-500">
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
      <p className="mb-4 text-neutral-600">No cocktails yet.</p>
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
        <button onClick={onBack} className="mb-4 text-sm text-neutral-500 hover:underline">
          ← Back
        </button>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {recipe.imageUrl && (
            <img src={recipe.imageUrl} alt={recipe.title} className="aspect-video w-full object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold">{recipe.title}</h1>
              {isAdmin && (
                <button
                  onClick={onEdit}
                  className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  Edit
                </button>
              )}
            </div>
            {recipe.description && (
              <p className="mt-2 text-neutral-600">{recipe.description}</p>
            )}

            <h2 className="mt-6 text-lg font-semibold">Ingredients</h2>
            <ul className="mt-3 space-y-2 pl-4">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-center text-base text-neutral-700">
                  <span className="mr-3 text-lg">•</span>
                  <span className="font-medium">{ing.name}</span>
                  <span className="ml-2 text-neutral-600">{ing.amount}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-lg font-semibold">How to make</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-800">
              {recipe.method}
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-600">Slug</div>
          <div className="text-sm font-mono">/{recipe.slug}</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-600">Average rating</div>
          <div className="text-lg font-semibold">{recipe.avgRating ?? "—"}</div>
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
          name: ing.name,
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
        <button onClick={onCancel} className="text-sm text-neutral-500 hover:underline">
          ← {mode === "create" ? "Cancel" : "Back"}
        </button>
        <h1 className="text-xl font-semibold">
          {mode === "create" ? "Create Recipe" : "Edit Recipe"}
        </h1>
        <div />
      </div>

      <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Title</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Whiskey Sour"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-600">Image URL</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-600">Short description (optional)</span>
          <input
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  className="col-span-6 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Ingredient (e.g., Lime juice)"
                  value={ing.name}
                  onChange={(e) => updateRow(ing.id, { name: e.target.value })}
                />
                <input
                  className="col-span-4 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Amount (e.g., 1 oz)"
                  value={ing.amount}
                  onChange={(e) => updateRow(ing.id, { amount: e.target.value })}
                />
                <button
                  onClick={() => removeRow(ing.id)}
                  className="col-span-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mt-3 rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            + Add ingredient
          </button>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-600">How to make</span>
          <textarea
            className="h-40 w-full resize-y rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Steps, techniques, notes…"
          />
        </label>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                imageUrl: imageUrl.trim() || undefined,
                description: description.trim() || undefined,
                method: method.trim(),
                ingredients: ingredients.map((i) => ({
                  id: i.id,
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
