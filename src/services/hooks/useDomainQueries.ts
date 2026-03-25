import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { businessSettingsService } from "@/services/endpoints/businessSettingsService";
import { categoriesService } from "@/services/endpoints/categoriesService";
import { componentProductsService } from "@/services/endpoints/componentProductsService";
import {
  componentsService,
  type ComponentFilters,
} from "@/services/endpoints/componentsService";
import {
  customerProductsService,
  type CustomerProductFilters,
} from "@/services/endpoints/customerProductsService";
import { customersService } from "@/services/endpoints/customersService";
import { orderItemsService } from "@/services/endpoints/orderItemsService";
import { orderProductionStepsService } from "@/services/endpoints/orderProductionStepsService";
import { ordersService, type OrderFilters } from "@/services/endpoints/ordersService";
import { productsService, type ProductFilters } from "@/services/endpoints/productsService";
import {
  supplierPurchaseOrderItemsService,
} from "@/services/endpoints/supplierPurchaseOrderItemsService";
import {
  supplierPurchaseOrdersService,
  type SupplierPurchaseOrderFilters,
} from "@/services/endpoints/supplierPurchaseOrdersService";
import { suppliersService } from "@/services/endpoints/suppliersService";
import { usersService } from "@/services/endpoints/usersService";
import { workCentersService } from "@/services/endpoints/workCentersService";
import { queryKeys } from "@/shared/constants/queryKeys";

export const useBusinessSettings = () =>
  useQuery({
    queryKey: queryKeys.businessSettings,
    queryFn: businessSettingsService.get,
  });

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesService.getList,
  });

export const useProducts = (filters?: ProductFilters) => {
  const normalized = useMemo(() => filters ?? {}, [filters]);

  return useQuery({
    queryKey: [...queryKeys.products, normalized],
    queryFn: () => productsService.getList(normalized),
  });
};

export const useProductById = (productId?: string) =>
  useQuery({
    enabled: Boolean(productId),
    queryKey: [...queryKeys.products, productId],
    queryFn: () => productsService.getById(productId ?? ""),
  });

export const useComponents = (filters?: ComponentFilters) => {
  const normalized = useMemo(() => filters ?? {}, [filters]);

  return useQuery({
    queryKey: [...queryKeys.components, normalized],
    queryFn: () => componentsService.getList(normalized),
  });
};

export const useComponentById = (componentId?: string) =>
  useQuery({
    enabled: Boolean(componentId),
    queryKey: [...queryKeys.components, componentId],
    queryFn: () => componentsService.getById(componentId ?? ""),
  });

export const useComponentProducts = (componentId?: string) =>
  useQuery({
    queryKey: [...queryKeys.componentProducts, componentId],
    queryFn: () => componentProductsService.getList(componentId),
  });

export const useCustomerProducts = (filters?: CustomerProductFilters) => {
  const normalized = useMemo(() => filters ?? {}, [filters]);

  return useQuery({
    queryKey: [...queryKeys.customerProducts, normalized],
    queryFn: () => customerProductsService.getList(normalized),
  });
};

export const useDiscounts = useCustomerProducts;

export const useOrders = (filters?: OrderFilters) => {
  const normalized = useMemo(() => filters ?? {}, [filters]);

  return useQuery({
    queryKey: [...queryKeys.orders, normalized],
    queryFn: () => ordersService.getList(normalized),
  });
};

export const useOrderById = (orderId?: string) =>
  useQuery({
    enabled: Boolean(orderId),
    queryKey: [...queryKeys.orders, orderId],
    queryFn: () => ordersService.getById(orderId ?? ""),
  });

export const useOrderItems = (orderId?: string) =>
  useQuery({
    queryKey: [...queryKeys.orderItems, orderId],
    queryFn: () => orderItemsService.getList(orderId),
  });

export const useOrderProductionSteps = (orderId?: string) =>
  useQuery({
    queryKey: [...queryKeys.orderProductionSteps, orderId],
    queryFn: () => orderProductionStepsService.getList(orderId),
  });

export const useCustomers = () =>
  useQuery({
    queryKey: queryKeys.customers,
    queryFn: customersService.getList,
  });

export const useCustomerById = (customerId?: string) =>
  useQuery({
    enabled: Boolean(customerId),
    queryKey: [...queryKeys.customers, customerId],
    queryFn: () => customersService.getById(customerId ?? ""),
  });

export const useSuppliers = () =>
  useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: suppliersService.getList,
  });

export const useSupplierById = (supplierId?: string) =>
  useQuery({
    enabled: Boolean(supplierId),
    queryKey: [...queryKeys.suppliers, supplierId],
    queryFn: () => suppliersService.getById(supplierId ?? ""),
  });

export const useSupplierPurchaseOrders = (filters?: SupplierPurchaseOrderFilters) => {
  const normalized = useMemo(() => filters ?? {}, [filters]);

  return useQuery({
    queryKey: [...queryKeys.supplierPurchaseOrders, normalized],
    queryFn: () => supplierPurchaseOrdersService.getList(normalized),
  });
};

export const useSupplierPurchaseOrderById = (purchaseOrderId?: string) =>
  useQuery({
    enabled: Boolean(purchaseOrderId),
    queryKey: [...queryKeys.supplierPurchaseOrders, purchaseOrderId],
    queryFn: () => supplierPurchaseOrdersService.getById(purchaseOrderId ?? ""),
  });

export const useSupplierPurchaseOrderItems = (purchaseOrderId?: string) =>
  useQuery({
    queryKey: [...queryKeys.supplierPurchaseOrderItems, purchaseOrderId],
    queryFn: () => supplierPurchaseOrderItemsService.getList(purchaseOrderId),
  });

export const useWorkCenters = () =>
  useQuery({
    queryKey: queryKeys.workCenters,
    queryFn: workCentersService.getList,
  });

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: usersService.getList,
  });
