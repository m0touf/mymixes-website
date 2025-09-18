import type { LandingPageProps } from "../types";
import { CocktailSlideshow } from "./CocktailSlideshow";

export function LandingPage({ onAdminLogin, onGuestAccess, cocktails }: LandingPageProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="max-w-2xl space-y-8">
        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-100">
            Welcome to my{" "}
            <span className="text-pink-600">personal cocktail menu</span>!
          </h1>
          {/* <p className="text-xl text-gray-400">
            Discover amazing cocktail recipes crafted with passion and precision.
            Whether you're a guest exploring or an admin managing recipes, there's
            something here for everyone.
          </p> */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={onGuestAccess}
            className="rounded-2xl border-2 border-pink-600 bg-transparent px-8 py-4 text-lg font-semibold text-pink-600 transition-colors hover:bg-pink-600 hover:text-white"
          >
            🍸 Browse as Guest
          </button>
          <button
            onClick={onAdminLogin}
            className="rounded-2xl bg-pink-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-pink-700"
          >
            🔐 Admin Login
          </button>
        </div>

        {/* Cocktail Slideshow */}
        <div className="pt-8">
          <CocktailSlideshow cocktails={cocktails} />
        </div>
      </div>
    </div>
  );
}
