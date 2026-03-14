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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: "#f4faff",
          color: "#111d23",
          boxShadow: "0 2px 4px rgba(0, 58, 77, 0.06)",
          borderBottom: "1px solid #d7e5ed",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 3,
            px: 4,
            minHeight: 64,
          }}
        >
          {/* Left Section: Title & Search */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
            {/* Page Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "#111d23",
                fontSize: "20px",
                whiteSpace: "nowrap",
              }}
            >
              {getPageTitle()}
            </Typography>

            {/* Search Input */}
            <TextField
              placeholder="Search insights..."
              size="small"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                maxWidth: 328,
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#e8f6fe",
                  borderRadius: "24px",
                  color: "#111d23",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #003a4d",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  padding: "8px 16px",
                  fontSize: "14px",
                  "&::placeholder": {
                    color: "#70787d",
                    opacity: 0.6,
                  },
                },
              }}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Notifications Button */}
            <IconButton
              sx={{
                width: 40,
                height: 40,
                color: "#40484c",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#e2f0f8",
                },
              }}
            >
              <Badge
                badgeContent={1}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ba1a1a",
                    color: "#ba1a1a",
                    boxShadow: `0 0 0 2px #f4faff`,
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
              sx={{
                height: 20,
                borderColor: "#c0c8cd44",
              }}
            />

            {/* User Profile Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                pl: 2,
                cursor: "pointer",
              }}
              onClick={handleMenuOpen}
            >
              <Avatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJr-81-ct22niioNCe6txV6VDlzBYT0B5-4L_1P6H88kI6ROpyY9tzPmbMMV_2Vwl2bfmOq5Dfejp1-7JAtDgy2eysTanY2SzXrgWlY6EK6gdbsAWB1fuz7BRnRH-xtoDVvXjNZho14nxqGMYSoTAV88hPLBwCczpfd0hQMJuOoUcFFdZozZB52qRmswkqktvAt3VgKEvuPb4hpSYQ-8TuNhrK7fAbH7CDo65X2p2OYY6W22vo0gWBOZADGl4ltFZIOjg4i9gFMQM"
                sx={{
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />

              {/* User Info - Hidden on small screens */}
              {isMdUp && (
                <Box sx={{ lineHeight: 1.2 }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111d23",
                    }}
                  >
                    Alex Mercer
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#70787d",
                    }}
                  >
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
                sx: {
                  backgroundColor: "#f4faff",
                  border: "1px solid #d7e5ed",
                },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  textAlign: "center",
                }}
              >
                <Avatar
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJr-81-ct22niioNCe6txV6VDlzBYT0B5-4L_1P6H88kI6ROpyY9tzPmbMMV_2Vwl2bfmOq5Dfejp1-7JAtDgy2eysTanY2SzXrgWlY6EK6gdbsAWB1fuz7BRnRH-xtoDVvXjNZho14nxqGMYSoTAV88hPLBwCczpfd0hQMJuOoUcFFdZozZB52qRmswkqktvAt3VgKEvuPb4hpSYQ-8TuNhrK7fAbH7CDo65X2p2OYY6W22vo0gWBOZADGl4ltFZIOjg4i9gFMQM"
                  sx={{
                    width: 40,
                    height: 40,
                    mx: "auto",
                    mb: 1,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#111d23",
                  }}
                >
                  Alex Mercer
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#70787d",
                  }}
                >
                  Fleet Manager
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "#d7e5ed" }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  justifyContent: "center",
                  fontWeight: 600,
                  color: "#ba1a1a",
                  "&:hover": {
                    backgroundColor: "#e8f6fe",
                  },
                }}
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
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          mt: 8,
          p: 3,
          overflow: "auto",
          flexGrow: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
