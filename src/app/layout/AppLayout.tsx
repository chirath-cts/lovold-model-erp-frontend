import { Outlet } from "react-router-dom";

import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f4faff] text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
