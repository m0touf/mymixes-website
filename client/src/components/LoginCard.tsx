import { useState } from "react";
import type { LoginCardProps } from "../types";

export function LoginCard({ onSubmit, loading, error }: LoginCardProps) {
  const [pwd, setPwd] = useState("");

  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold">Admin Login</h1>
      <p className="mb-6 text-sm text-gray-400">
        Enter password to manage recipes.
      </p>
      {error && (
        <div className="mb-4 rounded-lg border border-red-600 bg-red-900/20 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={() => onSubmit(pwd)}
          disabled={loading || !pwd.trim()}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
            loading || !pwd.trim()
              ? "cursor-not-allowed bg-gray-600"
              : "bg-pink-600 hover:bg-pink-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
