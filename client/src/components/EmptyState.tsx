import type { EmptyStateProps } from "../types";

export function EmptyState({ isAdmin, onCreate }: EmptyStateProps) {
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

export function EmptyGuestState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-600 bg-gray-800 py-16 text-center">
      <p className="mb-4 text-gray-400">No cocktails found.</p>
      <p className="text-sm text-gray-500">Try adjusting your search or check back later.</p>
    </div>
  );
}
