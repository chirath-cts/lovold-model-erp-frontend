import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";

import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";

import styles from "./AppLayout.module.scss";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box className={styles.shell} sx={{ display: "flex" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box className={styles.mainArea}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <Toolbar sx={{ minHeight: "64px !important" }} />
        <Box component="main" className={styles.content} sx={{ p: { xs: 1, md: 1, lg: 1 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
