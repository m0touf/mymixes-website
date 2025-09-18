// ---- Utility Functions ----

/**
 * Generate a unique ID for form elements
 */
export const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Generate a URL-friendly slug from a title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Format ingredients for display
 */
export const formatIngredients = (ingredients: Array<{ type?: { name: string }; amount: string }>) => {
  return ingredients.map((ing) => ({
    name: ing.type?.name || "",
    amount: ing.amount,
  }));
};
