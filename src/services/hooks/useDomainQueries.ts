import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { categoriesService } from "@/services/endpoints/categoriesService";
import { customersService } from "@/services/endpoints/customersService";
import { discountsService, type DiscountFilters } from "@/services/endpoints/discountsService";
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

export const useDiscounts = (filters?: DiscountFilters) => {
  const normalized = useMemo(() => filters ?? {}, [filters]);

  return useQuery({
    queryKey: [...queryKeys.discounts, normalized],
    queryFn: () => discountsService.getList(normalized),
  });
};

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
