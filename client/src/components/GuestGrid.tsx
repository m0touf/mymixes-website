import type { GuestGridProps } from "../types";
import { EmptyGuestState } from ".";

export function GuestGrid({
  recipes,
  search,
  setSearch,
  onOpen,
  loading,
  error,
}: GuestGridProps) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-100">Welcome to MyMixes</h1>
        <p className="mt-2 text-gray-400">Discover my amazing cocktail recipes</p>
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
        <EmptyGuestState />
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
