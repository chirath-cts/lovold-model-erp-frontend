import { useLocation } from "react-router-dom";

import { UserProfileMenu } from "@/app/layout/UserProfileMenu";
import { BellIcon, MenuIcon, SearchIcon } from "@/shared/ui/icons";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();

  const title = (() => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname.startsWith("/inventory/products")) return "Products";
    if (location.pathname.startsWith("/inventory/components")) return "Components";
    if (location.pathname.startsWith("/inventory/categories")) return "Categories";
    if (location.pathname.startsWith("/inventory/customer-pricing")) {
      return "Customer Pricing";
    }
    if (location.pathname.startsWith("/orders/new")) return "Create Order";
    if (location.pathname.startsWith("/orders/")) return "Order Detail";
    if (location.pathname.startsWith("/orders")) return "Orders";
    if (location.pathname.startsWith("/inbound/")) return "Supplier PO Detail";
    if (location.pathname.startsWith("/inbound")) return "Inbound Tracker";
    if (location.pathname.startsWith("/customers/")) return "Customer Profile";
    if (location.pathname.startsWith("/customers")) return "Customers";
    return "Lovold ERP";
  })();

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
