import type { SvgIconComponent } from "@mui/icons-material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import GiteRoundedIcon from "@mui/icons-material/GiteRounded";
import PriceCheckRoundedIcon from '@mui/icons-material/PriceCheckRounded';

export interface SidebarNavLink {
  type: "link";
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export interface SidebarNavGroup {
  type: "group";
  label: string;
  icon?: SvgIconComponent;
  children: SidebarNavLink[];
}

export type SidebarNavItem = SidebarNavLink | SidebarNavGroup;

export const sidebarNavStructure: SidebarNavItem[] = [
  {
    type: "link",
    label: "Dashboard",
    path: "/dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    type: "group",
    label: "Inventory",
    icon: GiteRoundedIcon,
    children: [
      {
        type: "link",
        label: "Products",
        path: "/inventory/products",
        icon: Inventory2RoundedIcon,
      },
      {
        type: "link",
        label: "Categories",
        path: "/inventory/categories",
        icon: CategoryRoundedIcon,
      },
      {
        type: "link",
        label: "Discounts",
        path: "/inventory/discounts",
        icon: LocalOfferRoundedIcon,
      },
    ],
  },
  {
    type: "group",
    label: "Sales",
    icon: ShoppingCartRoundedIcon,
    children: [
      {
        type: "link",
        label: "Orders",
        path: "/sales/orders",
        icon: ViewListRoundedIcon,
      },
    ],
  },
  {
    type: "link",
    label: "Customers",
    path: "/customers",
    icon: GroupRoundedIcon,
  },
];
