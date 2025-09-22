import { useState, useEffect } from "react";
import type { Recipe } from "../services/api";

// Dynamic API configuration (same as main API service)
const getApiBase = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  } else {
    return import.meta.env.VITE_API_URL || 'https://mymixes-website-production-5e7e.up.railway.app';
  }
};

const API_BASE = getApiBase();

interface QrToken {
  id: string;
  token: string;
  qrUrl: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  recipeId: number;
  recipe?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface QrManagerProps {
  recipes: Recipe[];
  onBack: () => void;
}

export function QrManager({ recipes, onBack }: QrManagerProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [qrTokens, setQrTokens] = useState<QrToken[]>([]);
  const [qrCounts, setQrCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing QR tokens
  const fetchQrTokens = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/qr`, {
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch QR tokens');
      }
      const tokens = await response.json();
      setQrTokens(tokens || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch QR tokens');
    }
  };

  // Fetch QR token counts per recipe
  const fetchQrCounts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/qr/counts`, {
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch QR counts');
      }
      const counts = await response.json();
      setQrCounts(counts || {});
    } catch (err) {
      console.error('Failed to fetch QR counts:', err);
      // Don't set error state for counts since it's not critical
    }
  };

  useEffect(() => {
    fetchQrTokens();
    fetchQrCounts();
  }, []);

  const generateQrToken = async () => {
    if (!selectedRecipeId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/qr/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ recipeId: selectedRecipeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate QR token');
      }

      const newToken = await response.json();
      setQrTokens(prev => [newToken, ...prev]);
      setSelectedRecipeId(null);
      // Refresh counts after creating a new QR token
      fetchQrCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR token');
    } finally {
      setLoading(false);
    }
  };

  const deleteQrToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/qr/${tokenId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete QR token');
      }

      // Remove the token from the list and refresh counts
      setQrTokens(prev => prev.filter(t => t.id !== tokenId));
      fetchQrCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete QR token');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin
        </button>
        <h1 className="text-2xl font-bold text-gray-100">QR Code Manager</h1>
      </div>

      {/* Generate New QR Code */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Generate New QR Code</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Recipe
            </label>
            <select
              value={selectedRecipeId || ''}
              onChange={(e) => setSelectedRecipeId(Number(e.target.value) || null)}
              className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="">Choose a recipe...</option>
              {recipes.map((recipe) => {
                const qrCount = qrCounts[recipe.id] || 0;
                return (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.title} {qrCount > 0 && `(${qrCount} QR code${qrCount > 1 ? 's' : ''})`}
                  </option>
                );
              })}
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-600 p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={generateQrToken}
            disabled={!selectedRecipeId || loading}
            className="w-full rounded-xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
      </div>

      {/* Existing QR Codes */}
      <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Existing QR Codes</h2>
        
        {qrTokens.length === 0 ? (
          <p className="text-gray-400">No QR codes generated yet.</p>
        ) : (
          <div className="space-y-4">
            {qrTokens.map((token) => (
              <div key={token.id} className="rounded-xl border border-gray-700 bg-gray-700/50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-200">
                      {token.recipe?.title || `Recipe ID: ${token.recipeId}`}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Expires: {new Date(token.expiresAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Status: {token.used ? (
                        <span className="text-yellow-400">Used</span>
                      ) : (
                        <span className="text-green-400">Active</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(token.qrUrl)}
                      className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
                    >
                      Copy URL
                    </button>
                    <a
                      href={token.qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-600 text-center"
                    >
                      Test
                    </a>
                    <button
                      onClick={() => deleteQrToken(token.id)}
                      className="rounded-lg border border-red-600 bg-red-700/20 px-3 py-1 text-sm text-red-400 hover:bg-red-700/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
