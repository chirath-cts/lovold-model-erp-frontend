import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Container, Paper, Typography } from "@mui/material";
import { LoadingOverlay } from "components/common";
import styles from "./Dashboard.module.scss";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className={styles.dashboardWrapper}>
        <Container maxWidth="lg" className={styles.dashboardContainer}>
          {/* Header */}
          <Paper elevation={3} className={styles.header}>
            <div className={styles.headerContent}>
              <Typography variant="h4" className={styles.title}>
                Welcome, {user.firstName} {user.lastName}!
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </Button>
            </div>
          </Paper>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
