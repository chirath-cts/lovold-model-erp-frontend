import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { navigateRoutes } from "constants";

import styles from "./Sidebar.module.scss";

const drawerWidth = 200;

const Sidebar = () => {
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const goToDashboard = () => {
    navigate(navigateRoutes.Dashboard);
  };

  return (
    <Drawer
      variant="permanent"
      className={styles.sidebarDrawer}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        className={styles.sidebarHeader}
        onClick={goToDashboard}
        sx={{ cursor: "pointer" }}
      >
        <Typography variant="h5" className={styles.sidebarLogo}>
          <WorkspacesIcon className={styles.sidebarLogoIcon} />
          PengVinERP
        </Typography>
      </Box>
      <List className={styles.sidebarList}>
        {[
          {
            items: [
              {
                label: "Dashboard",
                icon: <DashboardIcon className={styles.sidebarIcon} />,
                path: navigateRoutes.Dashboard,
              },
              {
                label: "Suppliers",
                icon: <DashboardIcon className={styles.sidebarIcon} />,
                path: navigateRoutes.Suppliers,
              },
              {
                label: "Customers",
                icon: <DashboardIcon className={styles.sidebarIcon} />,
                path: navigateRoutes.Customers,
              },
              {
                label: "Inventory",
                icon: <DashboardIcon className={styles.sidebarIcon} />,
                path: navigateRoutes.Inventory,
              },
              {
                label: "Sales",
                icon: <DashboardIcon className={styles.sidebarIcon} />,
                path: navigateRoutes.Sales,
              },
            ],
          },
          //   {
          //     section: "MANAGEMENT",
          //     items: [
          //       {
          //         label: "Users",
          //         icon: <PeopleIcon className={styles.sidebarIcon} />,
          //         path: navigateRoutes.Users,
          //       },
          //       {
          //         label: "Fish Farms",
          //         icon: <HomeWorkIcon className={styles.sidebarIcon} />,
          //         path: navigateRoutes.FishFarms,
          //       },
          //       {
          //         label: "Workers",
          //         icon: <EngineeringIcon className={styles.sidebarIcon} />,
          //         path: navigateRoutes.Workers,
          //       },
          //     ],
          //   },
        ].map((section, idx) => (
          <li className={styles.sidebarSection} key={idx}>
            <ul>
              <ListSubheader className={styles.sidebarSubheader}>
                {section.section}
              </ListSubheader>
              {section.items.map((item, i) => (
                <ListItem
                  key={i}
                  button
                  onClick={() => navigate(item.path)}
                  className={`${styles.sidebarItem} ${
                    isActive(item.path) ? styles.active : ""
                  }`}
                >
                  {item.icon && item.icon}
                  <ListItemText
                    primaryTypographyProps={{
                      fontSize: "12px",
                      color: "#FFFFFF",
                    }}
                    primary={item.label}
                  />
                </ListItem>
              ))}
            </ul>
          </li>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
