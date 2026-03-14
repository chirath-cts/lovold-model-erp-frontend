import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react"; 
import Sidebar from "../Sidebar/Sidebar";

import styles from "./MainLayout.module.scss";

const drawerWidth = 200;

const MainLayout = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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
          <Typography
            variant="h4"
            className={styles.mainTitle}
            gutterBottom
            fontWeight={600}
          >
            Welcome to PengVinERP
          </Typography>

          <Box>
            <IconButton onClick={handleMenuOpen}>
              {/* <Avatar alt={name} src={imageUrl} className={styles.mainAvatar} /> */}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              className={styles.mainMenu}
              PaperProps={{ className: `${styles.mainMenuPaper}` }}
              MenuListProps={{ className: `${styles.mainMenuList}` }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mb={1}
              >
                {/* <Avatar
                  alt={name}
                  src={imageUrl}
                  sx={{
                    mt: 2,
                    width: 32,
                    height: 32,
                    mb: 1,
                    bgcolor: "var(--primary-color)",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  noWrap
                  sx={{
                    fontSize: "14px",
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{
                    fontSize: "12px",
                  }}
                >
                  {email}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ mt: 0.5 }}
                >
                  {(Array.isArray(roles) ? roles : [roles]).map(
                    (role: string, index: number) => (
                      <Chip
                        key={index}
                        label={role}
                        sx={{
                          fontSize: "12px",
                          height: 20,
                        }}
                      />
                    ),
                  )}
                </Typography> */}
              </Box>
              <Divider className={styles.mainMenuDivider} />
              <MenuItem
                className={styles.mainMenuItem}
                onClick={handleLogout}
                sx={{
                  justifyContent: "center",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Sidebar />
      <Box
        component="main"
        className={styles.mainContent}
        sx={{ width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
