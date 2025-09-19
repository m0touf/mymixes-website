import type { TopBarProps } from "../types";

export function TopBar({ onLogoClick, isAdmin, onLogout, onLogin }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button onClick={onLogoClick} className="text-xl font-bold tracking-tight">
          my<span className="text-pink-600">mixes</span>
        </button>
      </div>
    </header>
  );
}
