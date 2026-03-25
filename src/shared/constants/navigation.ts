import type { ComponentType, SVGProps } from "react";

import {
  CategoryIcon,
  ComponentIcon,
  CustomersIcon,
  DashboardIcon,
  InboundIcon,
  InventoryIcon,
  OrdersIcon,
  PricingIcon,
} from "@/shared/ui/icons";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface SidebarNavLink {
  id: string;
  type: "link";
  label: string;
  path: string;
  icon: NavIcon;
}

export interface SidebarNavGroup {
  id: string;
  type: "group";
  label: string;
  icon?: NavIcon;
  children: SidebarNavLink[];
}

export type SidebarNavItem = SidebarNavLink | SidebarNavGroup;

export const sidebarNavStructure: SidebarNavItem[] = [
  {
    id: "dashboard",
    type: "link",
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardIcon,
  },
  {
    id: "orders",
    type: "link",
    label: "Orders",
    path: "/orders",
    icon: OrdersIcon,
  },
  {
    id: "inbound",
    type: "link",
    label: "Inbound",
    path: "/inbound",
    icon: InboundIcon,
  },
  {
    id: "customers",
    type: "link",
    label: "Customers",
    path: "/customers",
    icon: CustomersIcon,
  },
  {
    id: "inventory",
    type: "group",
    label: "Inventory",
    icon: InventoryIcon,
    children: [
      {
        id: "products",
        type: "link",
        label: "Products",
        path: "/inventory/products",
        icon: InventoryIcon,
      },
      {
        id: "components",
        type: "link",
        label: "Components",
        path: "/inventory/components",
        icon: ComponentIcon,
      },
      {
        id: "categories",
        type: "link",
        label: "Categories",
        path: "/inventory/categories",
        icon: CategoryIcon,
      },
      {
        id: "customer-pricing",
        type: "link",
        label: "Customer Pricing",
        path: "/inventory/customer-pricing",
        icon: PricingIcon,
      },
    ],
  },
];
