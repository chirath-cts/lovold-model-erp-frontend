import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import { LoadingOverlay } from "components/common";
import { Dashboard } from "constants/navigateRoutes";
import { useLogin } from "hooks/useLogin";
import styles from "./Login.module.scss";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { handleLogin, isLoading, error, setError } = useLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      const message = "Username and password are required";
      setError(message);
      toast.error(message);
      return;
    }

    const user = await handleLogin(username, password);

    if (user) {
      toast.success(`Welcome, ${user.firstName}!`);
      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      // Navigate to dashboard
      navigate(Dashboard);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}

      <div className={styles.loginWrapper}>
        <Container className={styles.loginContainer}>
          <Paper elevation={6} className={styles.loginCard}>
            <Typography className={styles.loginTitle}>
              <span>PengVinERP</span>
            </Typography>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!error && !username}
                disabled={isLoading}
              />
              <TextField
                label="Password"
                fullWidth
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error && !password}
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              {error && <Typography color="error">{error}</Typography>}
            </form>
          </Paper>
        </Container>
      </div>
    </>
  );
};

export default Login;
