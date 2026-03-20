import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { categoriesService } from "@/services/endpoints/categoriesService";
import {
  customerProductsService,
  type CustomerProductFilters,
} from "@/services/endpoints/customerProductsService";
import { customersService } from "@/services/endpoints/customersService";
import { orderItemsService } from "@/services/endpoints/orderItemsService";
import { ordersService, type OrderFilters } from "@/services/endpoints/ordersService";
import { productsService, type ProductFilters } from "@/services/endpoints/productsService";
import { usersService } from "@/services/endpoints/usersService";
import { queryKeys } from "@/shared/constants/queryKeys";

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

export const useOrderItems = (orderId?: string) =>
  useQuery({
    queryKey: [...queryKeys.orderItems, orderId],
    queryFn: () => orderItemsService.getList(orderId),
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

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: usersService.getList,
  });
