import type { TopBarProps } from "../types";

export function TopBar({ onLogoClick, isAdmin, onQrManager, currentPage }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button onClick={onLogoClick} className="text-xl font-bold tracking-tight">
          <span className="text-gray-100">my</span><span className="text-pink-600">mixes</span>
        </button>
        
        {/* Show QR Manager button only on admin home page */}
        {isAdmin && currentPage?.name === "home" && onQrManager && (
          <button
            onClick={onQrManager}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-600"
          >
            QR Manager
          </button>
        )}
      </div>
    </header>
  );
}
