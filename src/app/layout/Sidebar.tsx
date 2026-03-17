import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import {
  Box,
  Collapse,
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
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleGroupToggle = (groupId: string) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  };

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
            const isActive = isPathActive(item.path);

            return (
              <ListItemButton
                key={item.id}
                component={NavLink}
                to={item.path}
                onClick={onNavigate}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  color: "text.secondary",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "primary.dark",
                    color: "primary.contrastText",
                  },
                  "& .MuiListItemIcon-root": {
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
          const groupIsActive = item.children.some((child) => isPathActive(child.path));
          const isOpen = openGroupId === item.id;

          return (
            <Box key={item.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleGroupToggle(item.id)}
                selected={groupIsActive || isOpen}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.25,
                  color: "text.secondary",
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    color: "primary.main",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                }}
              >
                {GroupIcon ? (
                  <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                ) : (
                  <Box sx={{ width: 34 }} />
                )}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }}
                />
                {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = isPathActive(child.path);

                    return (
                      <ListItemButton
                        key={child.id}
                        component={NavLink}
                        to={child.path}
                        onClick={onNavigate}
                        selected={isChildActive}
                        sx={{
                          borderRadius: 1.25,
                          ml: 1,
                          mb: 0.25,
                          py: 0.75,
                          color: "text.secondary",
                          "&.Mui-selected": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                          },
                          "&.Mui-selected:hover": {
                            bgcolor: "primary.dark",
                            color: "primary.contrastText",
                          },
                          "& .MuiListItemIcon-root": {
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
                </List>
              </Collapse>
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
