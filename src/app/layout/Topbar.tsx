import { useLocation } from "react-router-dom";

import { UserProfileMenu } from "@/app/layout/UserProfileMenu";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" />
    </svg>
  );
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/inventory/products": "Products",
    "/inventory/categories": "Categories",
    "/inventory/discounts": "Customer Pricing",
    "/sales/orders": "Orders",
    "/customers": "Customers",
  };

  const title = location.pathname.startsWith("/customers/")
    ? "Customer Profile"
    : titleMap[location.pathname] ?? "PengVinERP";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[#f7f9fc] px-4 shadow-sm md:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-4 md:gap-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#40484e] transition-colors hover:bg-[#e8f6fe] lg:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <h2 className="text-lg font-bold text-[#111d23] md:text-xl">{title}</h2>

        <div className="relative hidden w-full max-w-md md:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#70787f]">
            <SearchIcon className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search insights..."
            className="w-full rounded-full bg-[#e8f6fe] py-2 pl-10 pr-4 text-sm text-[#111d23] placeholder:text-[#70787f] outline-none transition focus:ring-2 focus:ring-[#003a4d]"
          />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3 md:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#40484e] transition-colors hover:bg-[#e8f6fe]"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a]" />
        </button>

        <UserProfileMenu />
      </div>
    </header>
  );
}
