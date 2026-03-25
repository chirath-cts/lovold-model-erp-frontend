import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RequireAuth } from "@/app/auth/RequireAuth";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ComponentDetailPage } from "@/features/inventory/components/pages/ComponentDetailPage";
import { ComponentFormPage } from "@/features/inventory/components/pages/ComponentFormPage";
import { ProductsPage } from "@/features/inventory/products/pages/ProductsPage";
import { ProductDetailPage } from "@/features/inventory/products/pages/ProductDetailPage";
import { ProductFormPage } from "@/features/inventory/products/pages/ProductFormPage";
import { ComponentsPage } from "@/features/inventory/components/pages/ComponentsPage";
import { CategoriesPage } from "@/features/inventory/categories/pages/CategoriesPage";
import { CustomerPricingPage } from "@/features/inventory/customer-pricing/pages/CustomerPricingPage";
import { CustomersPage } from "@/features/customers/pages/CustomersPage";
import { CustomerDetailPage } from "@/features/customers/pages/CustomerDetailPage";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { CreateOrderPage } from "@/features/orders/pages/CreateOrderPage";
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage";
import { InboundTrackerPage } from "@/features/inbound/pages/InboundTrackerPage";
import { SupplierPurchaseOrderDetailPage } from "@/features/inbound/pages/SupplierPurchaseOrderDetailPage";

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
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory/products" element={<ProductsPage />} />
        <Route path="/inventory/products/new" element={<ProductFormPage />} />
        <Route path="/inventory/products/:productId" element={<ProductDetailPage />} />
        <Route
          path="/inventory/products/:productId/edit"
          element={<ProductFormPage />}
        />
        <Route path="/inventory/components" element={<ComponentsPage />} />
        <Route path="/inventory/components/new" element={<ComponentFormPage />} />
        <Route
          path="/inventory/components/:componentId"
          element={<ComponentDetailPage />}
        />
        <Route
          path="/inventory/components/:componentId/edit"
          element={<ComponentFormPage />}
        />
        <Route path="/inventory/categories" element={<CategoriesPage />} />
        <Route
          path="/inventory/customer-pricing"
          element={<CustomerPricingPage />}
        />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/new" element={<CreateOrderPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/inbound" element={<InboundTrackerPage />} />
        <Route
          path="/inbound/:purchaseOrderId"
          element={<SupplierPurchaseOrderDetailPage />}
        />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}
