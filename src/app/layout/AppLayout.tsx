import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";

import styles from "./AppLayout.module.scss";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`${styles.shell} flex min-h-screen`}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`${styles.mainArea} flex min-w-0 flex-1 flex-col`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className={`${styles.content} flex-1 p-1 md:p-1 lg:p-1`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
