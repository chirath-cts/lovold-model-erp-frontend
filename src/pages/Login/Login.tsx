import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import type { LoginDto } from "models/dto/login";
import { LoadingOverlay } from "components/common";
import { Dashboard } from "constants/navigateRoutes";
import styles from "./Login.module.scss";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Username and password are required");
      setIsLoading(false);
      toast.error("Username and password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/users");
      const data = await response.json();

      console.log("Login response data:", data);

      const user = data.find(
        (u: LoginDto) => u.username === username && u.password === password
      );

      if (user) {
        toast.success(`Welcome, ${user.firstName}!`);
        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        // Navigate to dashboard
        navigate(Dashboard);
      } else {
        setError("Invalid username or password");
        toast.error("Invalid username or password");
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = "Failed to connect to the server";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", err);
      setIsLoading(false);
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
              />
              <TextField
                label="Password"
                fullWidth
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error && !password}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className={styles.loginButton}
              >
                Login
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
