import { useState } from "react";
import type { RecipeFormProps, Ingredient } from "../types";
import { uid, generateSlug, formatIngredients } from "../utils/helpers";

export function RecipeForm({
  mode,
  initial,
  onCancel,
  onSubmit,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [method, setMethod] = useState(initial?.method ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients
      ? formatIngredients(initial.ingredients).map((ing) => ({
          id: uid(),
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
                slug: generateSlug(title.trim()),
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
