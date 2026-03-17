import type { SvgIconComponent } from "@mui/icons-material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GiteRoundedIcon from "@mui/icons-material/GiteRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded"; 
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";

export interface SidebarNavLink {
  id: string;
  type: "link";
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export interface SidebarNavGroup {
  id: string;
  type: "group";
  label: string;
  icon?: SvgIconComponent;
  children: SidebarNavLink[];
}

export type SidebarNavItem = SidebarNavLink | SidebarNavGroup;

export const sidebarNavStructure: SidebarNavItem[] = [
  {
    id: "dashboard",
    type: "link",
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    id: "inventory",
    type: "group",
    label: "Inventory",
    icon: GiteRoundedIcon,
    children: [
      {
        id: "products",
        type: "link",
        label: "Products",
        path: "/inventory/products",
        icon: Inventory2RoundedIcon,
      },
      {
        id: "categories",
        type: "link",
        label: "Categories",
        path: "/inventory/categories",
        icon: CategoryRoundedIcon,
      },
      {
        id: "discounts",
        type: "link",
        label: "Discounts",
        path: "/inventory/discounts",
        icon: LocalOfferRoundedIcon,
      },
    ],
  },
  {
    id: "sales",
    type: "group",
    label: "Sales",
    icon: ShoppingCartRoundedIcon,
    children: [
      {
        id: "orders",
        type: "link",
        label: "Orders",
        path: "/sales/orders",
        icon: ViewListRoundedIcon,
      },
    ],
  }, 
  {
    id: "customers",
    type: "link",
    label: "Customers",
    path: "/customers",
    icon: GroupRoundedIcon,
  },
];
