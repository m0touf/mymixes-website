import type { RecipeDetailProps } from "../types";

export function RecipeDetail({
  isAdmin,
  recipe,
  onBack,
  onEdit,
}: RecipeDetailProps) {
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

            {/* Reviews Section */}
            {recipe.reviews && recipe.reviews.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-semibold">Reviews</h2>
                <div className="mt-4 space-y-4">
                  {recipe.reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-gray-700 bg-gray-700/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200">
                            {review.name || 'Anonymous'}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
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
