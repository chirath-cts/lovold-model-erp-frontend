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

const palette = {
  surfaceContainerLow: "#e8f6fe",
  surfaceContainerHighest: "#d7e5ed",
  surfaceVariant: "#d7e5ed",
  outlineVariant: "#c0c8cd",
  outline: "#70787d",
  primary: "#003a4d",
  onPrimary: "#ffffff",
  onSurface: "#111d23",
  onSurfaceVariant: "#40484c",
} as const;

const fonts = {
  body: "'Inter', sans-serif",
  headline: "'Manrope', 'Inter', sans-serif",
} as const;

const drawerWidth = 256;

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: palette.surfaceContainerLow,
        color: palette.onSurface,
      }}
    >
      <Toolbar sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: palette.primary,
              color: palette.onPrimary,
              display: "grid",
              placeItems: "center",
            }}
          >
            <WaterDropRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                lineHeight: 1,
                color: "primary.main",
              }}
            >
              PengVinERP
            </Typography>
            <Typography
              sx={{
                fontSize: "10px",
                color: "#8A8A8A",
                letterSpacing: "0.05em",
                fontWeight: 500,
              }}
            >
              Enterprise Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* <Divider sx={{ borderColor: `${palette.outlineVariant}33` }} /> */}

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
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
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5, // gap-3
                  px: 2, // px-4
                  py: 1.5, // py-3
                  mb: 0.5,
                  borderRadius: "8px", // rounded-lg
                  color: palette.onSurfaceVariant,
                  textDecoration: "none",
                  fontWeight: 600,
                  minHeight: "unset",
                  transition: "background-color 120ms ease, color 120ms ease",

                  "&.Mui-selected": {
                    bgcolor: palette.surfaceContainerHighest,
                    color: palette.primary,
                    fontWeight: 600,
                    "& .MuiListItemText-primary": { fontWeight: 600 },
                    "& .MuiSvgIcon-root": { fontWeight: 600 },
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: palette.surfaceContainerHighest,
                    color: palette.primary,
                  },
                  "&:hover": {
                    bgcolor: palette.surfaceContainerHighest,
                    color: palette.primary,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "unset",
                    width: 20,
                    height: 20,
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 0,
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 20,
                      fontVariationSettings: "'FILL' 1",
                    }}
                  />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem", // text-sm
                    color: "inherit",
                    lineHeight: 1.2,
                  }}
                />
              </ListItemButton>
            );
          }

          const GroupIcon = item.icon;
          const groupIsActive = item.children.some((child) =>
            isPathActive(child.path),
          );
          const isOpen = openGroupId === item.id;

          return (
            <Box key={item.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleGroupToggle(item.id)}
                selected={groupIsActive || isOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: "8px",
                  color: palette.onSurfaceVariant,
                  fontWeight: 600,
                  transition: "background-color 120ms ease, color 120ms ease",

                  "&.Mui-selected": {
                    bgcolor: palette.surfaceContainerHighest,
                    color: palette.primary,
                    fontWeight: 600,
                    "& .MuiListItemText-primary": { fontWeight: 600 },
                    "& .MuiSvgIcon-root": { fontWeight: 600 },
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: palette.surfaceContainerHighest,
                    color: palette.primary,
                  },
                  "&:hover": {
                    bgcolor: palette.surfaceContainerHighest,
                    color: palette.primary,
                  },
                }}
              >
                {GroupIcon ? (
                  <ListItemIcon
                    sx={{
                      minWidth: "unset",
                      width: 20,
                      height: 20,
                      color: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 0,
                    }}
                  >
                    <GroupIcon
                      sx={{
                        fontSize: 20,
                        fontVariationSettings: "'FILL' 1",
                      }}
                    />
                  </ListItemIcon>
                ) : (
                  <Box sx={{ width: 20, height: 20 }} />
                )}

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    color: "inherit",
                    lineHeight: 1.2,
                  }}
                />

                {isOpen ? (
                  <ExpandLess sx={{ fontSize: 18, color: "inherit" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 18, color: "inherit" }} />
                )}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ mt: 0.5 }}>
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
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1.25,
                          ml: 2,
                          mb: 0.5,
                          borderRadius: "8px",
                          color: palette.onSurfaceVariant,
                          fontWeight: 600,
                          transition:
                            "background-color 120ms ease, color 120ms ease",

                          "&.Mui-selected": {
                            bgcolor: palette.surfaceContainerHighest,
                            color: palette.primary,
                            fontWeight: 600,
                            "& .MuiListItemText-primary": { fontWeight: 600 },
                            "& .MuiSvgIcon-root": { fontWeight: 600 },
                          },
                          "&.Mui-selected:hover": {
                            bgcolor: palette.surfaceContainerHighest,
                            color: palette.primary,
                          },
                          "&:hover": {
                            bgcolor: palette.surfaceContainerHighest,
                            color: palette.primary,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: "unset",
                            width: 18,
                            height: 18,
                            color: "inherit",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 0,
                          }}
                        >
                          <ChildIcon
                            sx={{
                              fontSize: 18,
                              fontVariationSettings: "'FILL' 1",
                            }}
                          />
                        </ListItemIcon>

                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            color: "inherit",
                            lineHeight: 1.2,
                          }}
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
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: palette.surfaceContainerLow,
            color: palette.onSurface,
            borderRight: `1px solid ${palette.surfaceVariant}`,
          },
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
            bgcolor: palette.surfaceContainerLow,
            color: palette.onSurface,
            borderRight: `1px solid ${palette.surfaceVariant}`,
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}
