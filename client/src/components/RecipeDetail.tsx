import type { RecipeDetailProps } from "../types";

export function RecipeDetail({
  isAdmin,
  recipe,
  onBack,
  onEdit,
  onDelete,
}: RecipeDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
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
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="rounded-xl border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`)) {
                          onDelete();
                        }
                      }}
                      className="rounded-xl border border-red-600 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
            {recipe.description && (
              <p className="mt-2 text-gray-400">{recipe.description}</p>
            )}

            <h2 className="mt-6 text-xl font-bold tracking-wide text-gray-100">Ingredients</h2>
            <div className="mt-4 space-y-2">
              {recipe.ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center justify-between border-b border-gray-700/50 py-3">
                  <span className="text-[14px] font-medium tracking-wide text-gray-100">
                    {(ing.type?.name || ing.name).replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-[14px] font-bold text-pink-400">
                    {ing.amount}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="mt-6 text-lg font-semibold">How to make</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {recipe.method}
            </p>

          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
          <div className="text-sm text-gray-400">Slug</div>
          <div className="text-sm font-mono text-gray-300">/{recipe.slug}</div>
        </div>
        
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
          <div className="text-sm text-gray-400">Average Rating</div>
          <div className="text-2xl font-bold text-pink-400">
            {recipe.avgRating ? recipe.avgRating.toFixed(1) : "—"}
          </div>
        </div>

        {/* Reviews Section */}
        {recipe.reviews && recipe.reviews.length > 0 && (
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Reviews</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recipe.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-700/50 pb-4 last:border-b-0 last:pb-0">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-200 text-sm">
                        {review.name || 'Anonymous'}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= review.rating ? 'text-pink-500' : 'text-gray-600'
                            }`}
                          >
                            <span className={star <= review.rating ? 'text-pink-500' : 'text-gray-600'}>★</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-2">{review.comment}</p>
                    <div className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
