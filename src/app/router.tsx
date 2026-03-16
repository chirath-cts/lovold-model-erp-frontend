import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { CustomerDetailsPage } from "@/features/customers/pages/CustomerDetailsPage";
import { CustomersPage } from "@/features/customers/pages/CustomersPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CategoriesPage } from "@/features/inventory/categories/pages/CategoriesPage";
import { DiscountsPage } from "@/features/inventory/discounts/pages/DiscountsPage";
import { ProductsPage } from "@/features/inventory/products/pages/ProductsPage";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RequireAuth } from "@/app/auth/RequireAuth";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory/products" element={<ProductsPage />} />
        <Route path="/inventory/categories" element={<CategoriesPage />} />
        <Route path="/inventory/discounts" element={<DiscountsPage />} />
        <Route path="/sales/orders" element={<OrdersPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}
