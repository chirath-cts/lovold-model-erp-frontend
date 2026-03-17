import { NavLink, useLocation } from "react-router-dom";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import { sidebarNavStructure } from "@/shared/constants/navigation";

const drawerWidth = 260;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <WaterDropRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              PengVinERP
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enterprise Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {sidebarNavStructure.map((item) => {
          if (item.type === "link") {
            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={onNavigate}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  color: "text.secondary",
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                  "&.active .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </ListItemButton>
            );
          }

          const GroupIcon = item.icon;
          const groupIsActive = item.children.some((child) =>
            location.pathname.startsWith(child.path),
          );

          return (
            <Box key={item.label} sx={{ mt: 1, mb: 0.5 }}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.7,
                  color: groupIsActive ? "primary.main" : "text.secondary",
                }}
              >
                {GroupIcon ? (
                  <Box sx={{ width: 20, display: "inline-flex", justifyContent: "center" }}>
                    <GroupIcon fontSize="small" />
                  </Box>
                ) : null}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 14,
                    fontWeight: groupIsActive ? 700 : 600,
                    letterSpacing: "0.04em",
                    // textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>

              {item.children.map((child) => {
                const ChildIcon = child.icon;

                return (
                  <ListItemButton
                    key={child.path}
                    component={NavLink}
                    to={child.path}
                    onClick={onNavigate}
                    sx={{
                      borderRadius: 1.5,
                      ml: 2.5,
                      mb: 0.5,
                      py: 0.75,
                      color: "text.secondary",
                      "&.active": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      },
                      "&.active .MuiListItemIcon-root": {
                        color: "inherit",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}>
                      <ChildIcon sx={{ fontSize: 15 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={child.label}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                    />
                  </ListItemButton>
                );
              })}
            </Box>
          );
        })}
      </List>
    </Box>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRightColor: "divider",
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}
