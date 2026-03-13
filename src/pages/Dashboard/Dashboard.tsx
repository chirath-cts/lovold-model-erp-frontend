import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
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

          {/* User Info Card */}
          <Grid container spacing={3} className={styles.content}>
            <Grid item xs={12} sm={6} md={4}>
              <Card className={styles.infoCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Username
                  </Typography>
                  <Typography variant="h6">{user.username}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className={styles.infoCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Role
                  </Typography>
                  <Typography variant="h6">{user.role}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card className={styles.infoCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Typography
                    variant="h6"
                    className={
                      user.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    {user.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card className={styles.detailsCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <Typography color="textSecondary">Email</Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </div>
                    <div className={styles.detailItem}>
                      <Typography color="textSecondary">User ID</Typography>
                      <Typography variant="body1">{user.id}</Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
