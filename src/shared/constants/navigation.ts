import type { SvgIconComponent } from "@mui/icons-material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardRoundedIcon },
  { label: "Products", path: "/inventory/products", icon: Inventory2RoundedIcon },
  { label: "Categories", path: "/inventory/categories", icon: CategoryRoundedIcon },
  { label: "Discounts", path: "/inventory/discounts", icon: LocalOfferRoundedIcon },
  { label: "Orders", path: "/sales/orders", icon: ShoppingCartRoundedIcon },
  { label: "Customers", path: "/customers", icon: GroupRoundedIcon },
];
