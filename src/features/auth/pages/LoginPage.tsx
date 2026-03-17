import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WavesRoundedIcon from "@mui/icons-material/WavesRounded";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { authService } from "@/services/endpoints/authService";
import { ApiError } from "@/services/http/errors";
import { getAuthSession, saveAuthSession } from "@/shared/lib/authSession";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = form.username.trim();
    if (!username || !form.password) {
      setError("Username and password are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const user = await authService.login({ username, password: form.password });
      saveAuthSession(user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Invalid username or password."
          : "Unable to sign in right now. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "center",
        px: { xs: 2.5, md: 6 },
        py: { xs: 5, md: 8 },
        overflow: "hidden",
      }}
    >
      {/* Background accents */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-18%",
            right: "-8%",
            width: { xs: "72%", md: "44%" },
            height: "64%",
            bgcolor: "primary.light",
            opacity: 0.35,
            filter: "blur(130px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-22%",
            left: "-6%",
            width: { xs: "78%", md: "52%" },
            height: "72%",
            bgcolor: "divider",
            opacity: 0.32,
            filter: "blur(160px)",
          }}
        />
      </Box>

      <Grid
        container
        spacing={{ xs: 5, md: 10 }}
        alignItems="center"
        sx={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%" }}
      >
        <Grid
          size={{ xs: 12, lg: 6 }}
          sx={{ display: { xs: "none", lg: "flex" }, pr: { lg: 6 } }}
        >
          <Stack spacing={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(0,58,77,0.16)",
                }}
              >
                <WavesRoundedIcon fontSize="medium" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                PengVinERP
              </Typography>
            </Stack>

            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { lg: "3rem", xl: "3.4rem" },
                  lineHeight: 1.05,
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Sustainable
                <br />
                <Box component="span" sx={{ color: "secondary.main" }}>
                  Aquaculture
                </Box>
                <br />
                Intelligence.
              </Typography>
            </Box>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 460, fontSize: "1.05rem" }}
            >
              Enterprise resource planning engineered for the precision demands of modern fish
              farming and aquatic logistics.
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                bgcolor: "background.paper",
                px: 3,
                py: 2.5,
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                boxShadow: "0 10px 22px rgba(0,28,38,0.06)",
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: "0.18em" }}
              >
                Infrastructure Status
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "secondary.main",
                    boxShadow: "0 0 0 6px rgba(31,101,129,0.14)",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  All Atlantic systems operational
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid
          size={{ xs: 12, lg: 6 }}
          sx={{ display: "flex", justifyContent: { xs: "center", lg: "flex-end" } }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "450px",
              maxWidth: { xs: 520, sm: 480, lg: 460 },
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: "0 14px 36px rgba(0,28,38,0.12)",
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={3}>
              <Box sx={{ display: { xs: "flex", lg: "none" }, justifyContent: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                  PengVinERP
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: "1.4rem", sm: "1.6rem" }, fontWeight: 800, mb: 0.5 }}
                >
                  Enterprise Portal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Secure access to aquaculture analytics.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    name="username"
                    label="Username"
                    type="text"
                    placeholder="Enter username"
                    fullWidth
                    required
                    value={form.username}
                    onChange={(event) => {
                      setForm((prev) => ({ ...prev, username: event.target.value }));
                      if (error) setError(null);
                    }}
                    autoComplete="username"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonRoundedIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                      <Typography
                        variant="caption"
                        sx={{ textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700 }}
                      >
                        Security Key
                      </Typography>
                      <Link
                        href="#"
                        underline="hover"
                        sx={{ fontSize: 12, fontWeight: 700, color: "secondary.main" }}
                      >
                        Forgot password?
                      </Link>
                    </Stack>
                    <TextField
                      name="password"
                      label="Password"
                      type="password"
                      placeholder="********"
                      fullWidth
                      required
                      value={form.password}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, password: event.target.value }));
                        if (error) setError(null);
                      }}
                      autoComplete="current-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <LockRoundedIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="remember"
                        color="primary"
                        size="small"
                        checked={form.remember}
                        onChange={(event) => setForm((prev) => ({ ...prev, remember: event.target.checked }))}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Remember this terminal
                      </Typography>
                    }
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={submitting}
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 800,
                      backgroundImage: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      color: "#ffffff",
                      boxShadow: "0 16px 38px rgba(0,58,77,0.18)",
                      "&:hover": {
                        boxShadow: "0 18px 42px rgba(0,58,77,0.26)",
                        backgroundImage: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      },
                      "&:active": { transform: "translateY(1px)" },
                    }}
                    endIcon={
                      submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />
                    }
                  >
                    {submitting ? "Signing In" : "Sign In"}
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  pt: 3,
                  mt: 1,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Authorized users only. Access is monitored.
                </Typography>
                <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 1.5 }}>
                  {["Support", "Security", "Privacy"].map((item) => (
                    <Link
                      key={item}
                      href="#"
                      underline="hover"
                      sx={{
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item}
                    </Link>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Wave accent */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        aria-hidden
        sx={{
          position: "fixed",
          bottom: -70,
          left: 0,
          width: "100%",
          height: 280,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        <path
          fill="#003a4d"
          d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,122.7C672,128,768,192,864,208C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Box>
    </Box>
  );
}
