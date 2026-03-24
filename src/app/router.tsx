import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RequireAuth } from "@/app/auth/RequireAuth";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate replace to="/login" />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}
