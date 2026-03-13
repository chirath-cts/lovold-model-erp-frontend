import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "pages";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
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
