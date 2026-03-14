import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login, Dashboard } from "pages";
import { Dashboard as DashboardRoute } from "constants/navigateRoutes";
import type { JSX } from "react";
import MainLayout from "components/layout/MainLayout/MainLayout";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={DashboardRoute} element={<Dashboard />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
