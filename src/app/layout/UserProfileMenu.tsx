import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  Avatar,
  Box,
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthSession } from "@/shared/hooks/useAuthSession";
import { clearAuthSession } from "@/shared/lib/authSession";

const avatarSize = 32;

export function UserProfileMenu() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const displayName = useMemo(() => {
    const name = [session?.firstName, session?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (name) return name;
    if (session?.username) return session.username;
    if (session?.email) return session.email;
    return "Account";
  }, [session]);

  const roleLabel = session?.role || "User";
  const email = session?.email || "No email available";

  const initials = useMemo(() => {
    const source =
      [session?.firstName, session?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      session?.username ||
      session?.email ||
      "U";

    return source
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [session]);

  const avatarSrc =
    (session as { avatarUrl?: string; avatar?: string; image?: string } | null)
      ?.avatarUrl ??
    (session as { avatarUrl?: string; avatar?: string; image?: string } | null)
      ?.avatar ??
    (session as { avatarUrl?: string; avatar?: string; image?: string } | null)
      ?.image;

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        pl: { xs: 1, md: 1 },
        // borderLeft: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
      }}
    >
      <ButtonBase
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "user-menu" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 0.75,
          py: 0.75,
          transition: (theme) =>
            theme.transitions.create(["background-color", "box-shadow"], {
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 600,
            fontSize: 12,
          }}
          src={avatarSrc}
          alt={displayName}
        >
          {initials}
        </Avatar>

        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            textAlign: "left",
            lineHeight: 1.2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
            noWrap
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "capitalize", display: "block" }}
            noWrap
          >
            {roleLabel}
          </Typography>
        </Box>
      </ButtonBase>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 240,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: "0 14px 36px rgba(0, 58, 77, 0.18)",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, maxWidth: 280 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, lineHeight: 1.2 }}
            noWrap
          >
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.25, gap: 1.25 }}>
          <LogoutRoundedIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
