import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, Dashboard } from "pages";
import { Dashboard as DashboardRoute } from "constants/navigateRoutes";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path={DashboardRoute} element={<Dashboard />} />
      {/* <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} /> 
      </Route> */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
