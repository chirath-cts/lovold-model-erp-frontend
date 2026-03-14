import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { useLocation } from "react-router-dom";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory/products": "Products",
  "/inventory/categories": "Categories",
  "/inventory/discounts": "Discounts",
  "/sales/orders": "Orders",
  "/customers": "Customers",
};

export function Topbar() {
  const location = useLocation();

  const title = location.pathname.startsWith("/customers/")
    ? "Customer Profile"
    : (titleMap[location.pathname] ?? "LOVOLD ERP");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <SearchRoundedIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <input
              className="w-64 bg-transparent text-sm text-slate-700 outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
        <button className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100">
          <NotificationsNoneRoundedIcon />
        </button>
      </div>
    </header>
  );
}
