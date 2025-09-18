// Utility to generate QR code URLs for reviews
// In production, you would generate these server-side with proper security

export function generateReviewQRUrl(recipeId: number, baseUrl: string = 'http://localhost:5173'): string {
  // Generate a simple hash for the recipe (in production, use proper crypto)
  const hash = btoa(`review-${recipeId}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '');
  return `${baseUrl}/#/review/${recipeId}?token=${hash}`;
}

// For testing purposes - you can call this to get a QR code URL
export function getTestReviewUrl(recipeId: number): string {
  return generateReviewQRUrl(recipeId);
}

// Example usage:
// console.log(getTestReviewUrl(1)); // Generates: http://localhost:5173/#/review/1?token=abc123
