import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./MainLayout.module.scss";

const drawerWidth = 256;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate("/");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("dashboard"))
      return "Dashboard";
    if (location.pathname.includes("suppliers")) return "Suppliers";
    if (location.pathname.includes("customers")) return "Customers";
    if (location.pathname.includes("inventory")) return "Inventory";
    if (location.pathname.includes("sales")) return "Sales";
    return "Dashboard";
  };

  return (
    <Box className={styles.mainLayout}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={styles.mainAppbar}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar className={styles.mainToolbar}>
          {/* Left Section: Title & Search */}
          <Box className={styles.leftSection}>
            {/* Page Title */}
            <Typography className={styles.pageTitle}>
              {getPageTitle()}
            </Typography>

            {/* Search Input */}
            <TextField
              placeholder="Search insights..."
              size="small"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.searchInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#70787d", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Right Section: Notifications & Profile */}
          <Box className={styles.rightSection}>
            {/* Notifications Button */}
            <IconButton
              className={styles.notificationButton}
            >
              <Badge
                badgeContent={1}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ba1a1a",
                    color: "#ba1a1a",
                    boxShadow: "0 0 0 2px #f4faff",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    right: 0,
                    top: 4,
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* Divider */}
            <Divider
              orientation="vertical"
              className={styles.dividerVertical}
            />

            {/* User Profile Section */}
            <Box
              className={styles.userProfileBox}
              onClick={handleMenuOpen}
            >
              <Avatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJr-81-ct22niioNCe6txV6VDlzBYT0B5-4L_1P6H88kI6ROpyY9tzPmbMMV_2Vwl2bfmOq5Dfejp1-7JAtDgy2eysTanY2SzXrgWlY6EK6gdbsAWB1fuz7BRnRH-xtoDVvXjNZho14nxqGMYSoTAV88hPLBwCczpfd0hQMJuOoUcFFdZozZB52qRmswkqktvAt3VgKEvuPb4hpSYQ-8TuNhrK7fAbH7CDo65X2p2OYY6W22vo0gWBOZADGl4ltFZIOjg4i9gFMQM"
                className={styles.userAvatar}
              />

              {/* User Info - Hidden on small screens */}
              {isMdUp && (
                <Box className={styles.userInfo}>
                  <Typography className={styles.userNameText}>
                    Alex Mercer
                  </Typography>
                  <Typography className={styles.userRoleText}>
                    Fleet Manager
                  </Typography>
                </Box>
              )}
            </Box>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                className: styles.menuPaper,
              }}
            >
              <Box className={styles.menuContentBox}>
                <Avatar
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJr-81-ct22niioNCe6txV6VDlzBYT0B5-4L_1P6H88kI6ROpyY9tzPmbMMV_2Vwl2bfmOq5Dfejp1-7JAtDgy2eysTanY2SzXrgWlY6EK6gdbsAWB1fuz7BRnRH-xtoDVvXjNZho14nxqGMYSoTAV88hPLBwCczpfd0hQMJuOoUcFFdZozZB52qRmswkqktvAt3VgKEvuPb4hpSYQ-8TuNhrK7fAbH7CDo65X2p2OYY6W22vo0gWBOZADGl4ltFZIOjg4i9gFMQM"
                  className={styles.menuAvatar}
                />
                <Typography className={styles.menuUserName}>
                  Alex Mercer
                </Typography>
                <Typography variant="caption" className={styles.menuUserRole}>
                  Fleet Manager
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "#d7e5ed" }} />
              <MenuItem
                onClick={handleLogout}
                className={styles.logoutMenuItem}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        className={styles.mainContent}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
