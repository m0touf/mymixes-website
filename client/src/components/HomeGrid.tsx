import type { HomeGridProps } from "../types";
import { EmptyState } from ".";

export function HomeGrid({
  isAdmin,
  recipes,
  search,
  setSearch,
  onCreate,
  onOpen,
  loading,
  error,
}: HomeGridProps) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-gray-100">my</span>
          <span className="text-pink-600">mixes</span>
        </h1>
        <p className="mt-2 text-gray-400">Manage your cocktail recipes</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cocktails or ingredients…"
            className="w-full rounded-2xl border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
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
              className="group overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-sm transition hover:shadow-md hover:border-pink-500 hover:bg-pink-500/5"
            >
              <button onClick={() => onOpen(r.id)} className="block w-full text-left">
                <div className="aspect-square w-full overflow-hidden bg-gray-700">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{
                        objectPosition: 'center center'
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                      <div className="mb-2 text-4xl">🍹</div>
                      <div className="text-sm">No image</div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-lg font-semibold text-white">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {r.description || r.method}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{r._count?.ingredients || r.ingredients?.length || 0} ingredients</span>
                    {r.avgRating && r.avgRating > 0 && (
                      <span className="flex items-center gap-1">
                        ⭐ {r.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </article>
          ))}
          
          {/* Large Add Button */}
          {isAdmin && (
            <button
              onClick={onCreate}
              className="group overflow-hidden rounded-2xl border-2 border-dashed border-gray-600 bg-gray-800/50 transition hover:border-pink-500 hover:bg-pink-500/10"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-700/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-700 text-gray-400 transition group-hover:border-pink-500 group-hover:bg-pink-500 group-hover:text-pink-500">
                    <span className="text-3xl font-light">+</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-300 group-hover:text-pink-400">
                  Add Recipe
                </h3>
                <p className="mt-1 text-sm text-gray-400 group-hover:text-pink-300">
                  Create a new cocktail recipe
                </p>
                <div className="mt-3 text-xs text-gray-500 group-hover:text-pink-300">
                  Click to start
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
