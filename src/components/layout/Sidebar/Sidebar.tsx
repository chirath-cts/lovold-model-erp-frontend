import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StorageIcon from "@mui/icons-material/Storage";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import { navigateRoutes } from "constants";

const drawerWidth = 256;

const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isActive = (path: string) => location.pathname === path;

  const goToDashboard = () => {
    navigate(navigateRoutes.Dashboard);
  };

  const mainMenuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      path: navigateRoutes.Dashboard,
    },
    {
      label: "Suppliers",
      icon: <BusinessIcon />,
      path: navigateRoutes.Suppliers,
    },
    {
      label: "Customers",
      icon: <PeopleIcon />,
      path: navigateRoutes.Customers,
    },
    {
      label: "Inventory",
      icon: <InventoryIcon />,
      path: navigateRoutes.Inventory,
    },
    {
      label: "Sales",
      icon: <ShoppingCartIcon />,
      path: navigateRoutes.Sales,
    },
  ];

  const bottomMenuItems = [
    {
      label: "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
    },
    {
      label: "Support",
      icon: <HelpIcon />,
      path: "/support",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#e8f6fe",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #d7e5ed",
        },
      }}
    >
      {/* Header Section */}
      <Box
        onClick={goToDashboard}
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          "&:hover": {
            opacity: 0.85,
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "8px",
            backgroundColor: "#003a4d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            flexShrink: 0,
          }}
        >
          <StorageIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#003a4d",
              lineHeight: 1.2,
              fontSize: "18px",
            }}
          >
            PengVinERP
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              color: "#70787d",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Enterprise Portal
          </Typography>
        </Box>
      </Box>

      {/* Main Navigation */}
      <List
        sx={{
          flex: 1,
          px: 2,
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {mainMenuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.path}
              button
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: "8px",
                px: 2,
                py: 1.5,
                gap: 1.5,
                backgroundColor: active ? "#d7e5ed" : "transparent",
                color: active ? "#003a4d" : "#40484c",
                fontWeight: active ? 600 : 500,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d7e5ed",
                  color: "#003a4d",
                },
                "& .MuiListItemIcon-root": {
                  minWidth: 24,
                  color: "inherit",
                },
                "& .MuiListItemText-primary": {
                  fontSize: "14px",
                  fontWeight: "inherit",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          );
        })}
      </List>

      {/* Divider */}
      <Divider sx={{ borderColor: "#c0c8cd" }} />

      {/* Bottom Navigation */}
      <List
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {bottomMenuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: "8px",
              px: 2,
              py: 1,
              gap: 1.5,
              color: "#40484c",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#d7e5ed",
                color: "#003a4d",
              },
              "& .MuiListItemIcon-root": {
                minWidth: 24,
                color: "inherit",
              },
              "& .MuiListItemText-primary": {
                fontSize: "14px",
                fontWeight: "inherit",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
