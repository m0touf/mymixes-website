import { useState } from "react";
import type { Recipe } from "../services/api";

interface ReviewPageProps {
  recipe: Recipe;
  token?: string;
  onBack: () => void;
}

interface ReviewFormData {
  name: string;
  rating: number;
  comment: string;
}

export function ReviewPage({ recipe, token, onBack }: ReviewPageProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    rating: 5,
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = new URL(`http://localhost:4000/recipes/${recipe.id}/anonymous-reviews`);
      if (token) {
        url.searchParams.append('token', token);
      }
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          rating: formData.rating,
          comment: formData.comment.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReviewFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-400 mb-6">
              Your review for <span className="text-pink-600 font-semibold">{recipe.title}</span> has been submitted successfully.
            </p>
            <button
              onClick={onBack}
              className="rounded-xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-md px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Leave a Review
          </h1>
          <p className="text-gray-400">
            Share your thoughts about <span className="text-pink-600 font-semibold">{recipe.title}</span>
          </p>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
            {/* Name Field */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                maxLength={50}
              />
            </div>

            {/* Rating Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoveredStar || formData.rating);
                  const isSelected = star <= formData.rating;
                  
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleInputChange('rating', star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className={`
                        text-3xl transition-all duration-200 transform hover:scale-110 
                        ${isActive 
                          ? 'text-pink-500 drop-shadow-lg' 
                          : 'text-gray-600 hover:text-gray-400'
                        }
                        ${isSelected ? 'animate-pulse' : ''}
                        hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]
                        focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded
                      `}
                      title={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-sm">
                <p className="text-gray-400">
                  {hoveredStar ? (
                    <span className="text-pink-500 font-medium">
                      {hoveredStar} star{hoveredStar > 1 ? 's' : ''} - {getRatingText(hoveredStar)}
                    </span>
                  ) : (
                    <span className="text-gray-300">
                      {formData.rating} out of 5 stars - {getRatingText(formData.rating)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Comment Field */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                Your Review *
              </label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Tell us what you thought about this cocktail..."
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.comment.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-900/20 border border-red-600 p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
