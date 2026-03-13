import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import type { LoginDto } from "models/dto/login";
import { LoadingOverlay } from "components/common";
import styles from "./Login.module.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      toast.error("Email and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      toast.error("Invalid email format");
      return;
    }
    const reqData: LoginDto = {
      email: email,
      password: password,
    };

    console.log("Login data:", reqData);
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
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={
                  !!error &&
                  (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                }
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
