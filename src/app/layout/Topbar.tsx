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

const palette = {
  surface: "#f4faff",
  surfaceContainerLow: "#e8f6fe",
  outlineVariant: "#c0c8cd",
  primary: "#003a4d",
  onSurface: "#111d23",
  onSurfaceVariant: "#40484c",
  error: "#ba1a1a",
} as const;

const fonts = {
  body: "'Inter', sans-serif",
  headline: "'Manrope', 'Inter', sans-serif",
} as const;

const drawerWidth = 256;

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory/products": "Products",
  "/inventory/categories": "Categories",
  "/inventory/discounts": "Discounts",
  "/sales/orders": "Orders",
  "/customers": "Customers",
};

interface TopbarProps {
  onMenuClick: () => void;
}

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
        bgcolor: palette.surface,
        color: palette.onSurface,
        // borderBottom: `1px solid ${palette.outlineVariant}33`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px !important",
          gap: "1.5rem", 
        }}
      >
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { lg: "none" } }}
          aria-label="open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontFamily: fonts.headline,
            color: palette.onSurface,
            fontSize: 20,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: { xs: "none", md: "block" },
            flexGrow: 1,
            maxWidth: 420,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search insights..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    fontSize="small"
                    sx={{ color: palette.onSurfaceVariant }}
                  />
                </InputAdornment>
              ),
              sx: {
                bgcolor: palette.surfaceContainerLow,
                borderRadius: 999,
                height: 40,
                fontSize: 14,
                "& fieldset": { border: "none" },
              },
            }}
            inputProps={{
              sx: {
                "::placeholder": { color: `${palette.onSurfaceVariant}99` },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 1.5, lg: 2 },
          }}
        >
          <IconButton
            aria-label="notifications"
            sx={{
              width: 40,
              height: 40,
              color: palette.onSurfaceVariant,
              "&:hover": { bgcolor: palette.surfaceContainerLow },
            }}
          >
            <Badge
              variant="dot"
              color="error"
              sx={{
                "& .MuiBadge-dot": {
                  width: 8,
                  height: 8,
                  minWidth: 8,
                  bgcolor: palette.error,
                },
              }}
            >
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderLeft: `1px solid ${palette.outlineVariant}55`,
            }}
          >
            <UserProfileMenu />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
