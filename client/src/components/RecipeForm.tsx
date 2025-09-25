import { useState, useEffect } from "react";
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
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (initial?.ingredients) {
      const formatted = formatIngredients(initial.ingredients);
      return formatted.map((ing) => ({
        id: uid(),
        name: ing.name,
        amount: ing.amount,
      }));
    }
    return [{ id: uid(), name: "", amount: "" }];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Update ingredients when initial prop changes
  useEffect(() => {
    if (initial?.ingredients && mode === "edit") {
      const formatted = formatIngredients(initial.ingredients);
      setIngredients(formatted.map((ing) => ({
        id: uid(),
        name: ing.name,
        amount: ing.amount,
      })));
    }
  }, [initial?.ingredients, mode]);

  const addRow = () =>
    setIngredients((prev) => [...prev, { id: uid(), name: "", amount: "" }]);
  
  const removeRow = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  
  const updateRow = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setErrors(prev => ({ ...prev, imageUrl: "" }));
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a JPG, PNG, GIF, or WebP image');
      }
      
      // Validate file size (max 2MB for base64)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('Image must be smaller than 2MB. For larger images, please use an image URL instead.');
      }
      
      // Compress and convert to base64 for now (we can implement proper upload later)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setImageUrl(compressedDataUrl);
        setIsUploading(false);
      };
      
      img.onerror = () => {
        setErrors(prev => ({ ...prev, imageUrl: "Failed to process image file" }));
        setIsUploading(false);
      };
      
      img.src = URL.createObjectURL(file);
      
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        imageUrl: error instanceof Error ? error.message : "Failed to upload image. Please try again or use a URL instead." 
      }));
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters long";
    }
    
    // Method validation
    if (!method.trim()) {
      newErrors.method = "Recipe instructions are required";
    } else if (method.trim().length < 5) {
      newErrors.method = "Recipe instructions must be at least 5 characters long";
    }
    
    // Image URL validation
    if (imageUrl.trim() && !isValidUrl(imageUrl.trim())) {
      newErrors.imageUrl = "Please enter a valid image URL";
    }
    
    // Ingredients validation
    const emptyIngredients = ingredients.filter(i => !i.name.trim() || !i.amount.trim());
    if (emptyIngredients.length > 0) {
      newErrors.ingredients = "All ingredients must have both name and amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        title: title.trim(),
        slug: generateSlug(title.trim()),
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        method: method.trim(),
        ingredients: ingredients.map((i) => ({
          name: i.name.trim(),
          amount: i.amount.trim(),
        })),
      });
    } catch (error: any) {
      // Handle server-side validation errors
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        setErrors(prev => ({ ...prev, title: "A recipe with this name already exists" }));
      } else {
        setErrors(prev => ({ ...prev, general: error.message || "Failed to create recipe" }));
      }
    }
  };

  const disabled =
    !title.trim() ||
    !method.trim() ||
    ingredients.some((i) => !i.name.trim() || !i.amount.trim()) ||
    isUploading;

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
        {/* General Error Message */}
        {errors.general && (
          <div className="rounded-xl bg-red-900/20 border border-red-600 p-3">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-400">Title</span>
            <input
              className={`w-full rounded-xl border px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                errors.title ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
              }`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
              }}
              placeholder="e.g., Whiskey Sour"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            )}
          </label>
          
          <label className="block text-sm">
            <span className="mb-1 block text-gray-400">Image</span>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className={`block w-full cursor-pointer rounded-xl border border-dashed px-3 py-2 text-center text-sm transition-colors ${
                  isUploading 
                    ? 'border-yellow-500 bg-yellow-900/20 text-yellow-400' 
                    : 'border-gray-600 bg-gray-700 text-gray-400 hover:border-pink-500 hover:text-pink-400'
                }`}
              >
                {isUploading ? 'Processing...' : '📷 Upload Image (JPG, PNG, GIF, WebP)'}
              </label>
              
              <input
                className={`w-full rounded-xl border px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.imageUrl ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                }`}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: "" }));
                }}
                placeholder="Or paste image URL here"
              />
              {errors.imageUrl && (
                <p className="text-xs text-red-400">{errors.imageUrl}</p>
              )}
            </div>
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
          {errors.ingredients && (
            <p className="mb-2 text-xs text-red-400">{errors.ingredients}</p>
          )}
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <div key={ing.id} className="grid grid-cols-12 items-center gap-2">
                <input
                  className={`col-span-6 rounded-xl border px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    (!ing.name.trim() && errors.ingredients) ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="Ingredient (e.g., Lime juice)"
                  value={ing.name}
                  onChange={(e) => updateRow(ing.id, { name: e.target.value })}
                />
                <input
                  className={`col-span-4 rounded-xl border px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    (!ing.amount.trim() && errors.ingredients) ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
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
            className={`h-40 w-full resize-y rounded-xl border px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
              errors.method ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
            }`}
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              if (errors.method) setErrors(prev => ({ ...prev, method: "" }));
            }}
            placeholder="Steps, techniques, notes…"
          />
          {errors.method && (
            <p className="mt-1 text-xs text-red-400">{errors.method}</p>
          )}
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
            onClick={handleSubmit}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
              disabled ? "cursor-not-allowed bg-neutral-300" : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {isUploading ? "Uploading..." : (mode === "create" ? "Create" : "Save changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
