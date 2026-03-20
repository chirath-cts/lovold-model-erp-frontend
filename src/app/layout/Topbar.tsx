import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";

import { UserProfileMenu } from "@/app/layout/UserProfileMenu";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory/products": "Products",
  "/inventory/categories": "Categories",
  "/inventory/discounts": "Customer Pricing",
  "/sales/orders": "Orders",
  "/customers": "Customers",
};

interface TopbarProps {
  onMenuClick: () => void;
}

const drawerWidth = 260;

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();

  const title = location.pathname.startsWith("/customers/")
    ? "Customer Profile"
    : (titleMap[location.pathname] ?? "PengVinERP");

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important", gap: 2, px: { xs: 2, md: 3, lg: 4 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { lg: "none" } }}
          aria-label="open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Box sx={{ display: { xs: "none", md: "block" }, flexGrow: 1, maxWidth: 420 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5, lg: 2 } }}>
          <IconButton color="inherit" aria-label="notifications">
            <Badge variant="dot" color="error">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>

          <UserProfileMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
