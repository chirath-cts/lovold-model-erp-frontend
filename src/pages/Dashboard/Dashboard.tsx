import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import {
  ShoppingBag,
  TrendingUp,
  Verified,
  Warning,
  People,
  CalendarToday,
} from "@mui/icons-material";

interface KPICard {
  label: string;
  value: string;
  subtitle: string;
  badge?: {
    text: string;
    bgColor: string;
    textColor: string;
  };
  icon?: React.ReactNode;
}

interface OrderRow {
  id: string;
  customer: string;
  initials: string;
  avatarBg: string;
  date: string;
  amount: string;
  status: string;
  statusBg: string;
  statusColor: string;
}

interface TopCustomer {
  name: string;
  orders: string;
  revenue: string;
  image: string;
}

interface StockProduct {
  name: string;
  sku: string;
  quantity: string;
  color: string;
}

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("today");

  const kpiCards: KPICard[] = [
    {
      label: "Total Sales",
      value: "$124,500",
      subtitle: "vs. last period",
      badge: { text: "+12%", bgColor: "#bfe8ff", textColor: "#00526c" },
    },
    {
      label: "Total Orders",
      value: "1,240",
      subtitle: "Confirmed orders",
      icon: <ShoppingBag sx={{ fontSize: 24, color: "#1f6581" }} />,
    },
    {
      label: "Est. Profit",
      value: "$32,000",
      subtitle: "Margin: 25.7%",
      badge: { text: "Safe", bgColor: "#9eddfd", textColor: "#1a627e" },
    },
    {
      label: "Low Stock",
      value: "12",
      subtitle: "SKUs near threshold",
      badge: { text: "Action", bgColor: "#ffdad6", textColor: "#93000a" },
    },
    {
      label: "Active Customers",
      value: "450",
      subtitle: "Active this month",
      icon: <People sx={{ fontSize: 24, color: "#003a4d" }} />,
    },
  ];

  const orders: OrderRow[] = [
    {
      id: "#ORD-9021",
      customer: "Jordan Bay",
      initials: "JB",
      avatarBg: "#bfe8ff",
      date: "Oct 24, 2023",
      amount: "$2,450.00",
      status: "Shipped",
      statusBg: "#9eddfd",
      statusColor: "#1a627e",
    },
    {
      id: "#ORD-9022",
      customer: "Marina South",
      initials: "MS",
      avatarBg: "#bfe8ff",
      date: "Oct 23, 2023",
      amount: "$12,100.00",
      status: "Processing",
      statusBg: "#d7e5ed",
      statusColor: "#40484c",
    },
    {
      id: "#ORD-9023",
      customer: "Lake Central",
      initials: "LC",
      avatarBg: "#c7e7f9",
      date: "Oct 23, 2023",
      amount: "$850.50",
      status: "Delivered",
      statusBg: "#9eddfd",
      statusColor: "#1a627e",
    },
  ];

  const topCustomers: TopCustomer[] = [
    {
      name: "Oceanic Farms Ltd",
      orders: "12 orders this month",
      revenue: "$45.2k",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDpp_iDqaIJF9rvGHAHx5a5pWBsIBt85plVO3cib42CBhILyVykWeWYBHdzATYPgbgECYjGQw5v4F3hbH1HsGZjskytyl84wDY9gXReNJ9GqtI7xpPvEpAX-CcFdv7tUmH_9fODenGmH0FOCnOPLjpea2O6K3HZRw3Z9ymGF5Efzd2a94zOeE70yJCoG12Mf3sGtPPvxCYFNF_qPRJFY-uZXqIP_xna5q3XZPRaT06EEayWQVzOQJ-Qw1yemcD-tVuLFu2UoEbO7hQ",
    },
    {
      name: "Blue Horizon Agri",
      orders: "8 orders this month",
      revenue: "$31.8k",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAr24FZYN0lnXserYrt-L8I6rBqfBymuk8YbOY1Wam5kFuEisB1X7VjUhlOWBD7FDRDg3lE1NA8su9fIbMkkLJSMEIXEMU-ZcaCmsbr1YVrvD1Hu1k972Fgr-VM5SC2BlxBIO-JwSB5bKEtBLEwGgs1kpOY6rGlx7mqf3pfXKEXrKsJ8L3YmTcfA6Dr-P1yHWgEniaY_XL2-a2MyhozJoEXmP_hV9dy5c-lEwXGMUuwPzaHApuv_hBYLagmoF0s_1WXAmo7ikCzM0k",
    },
    {
      name: "Deep Tide Co.",
      orders: "15 orders this month",
      revenue: "$28.4k",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDMDGhNzeIQYZYT8pe7K89ptf8uUlVa8K_Mv8yXxpc81vNpT0J7pyMYlKqQD1yby49VwXI3SG3EU195MPNfgNgIwtd2GhujCa9hY8vU7NSpTH8aZpMlfXKeU_rGo3KLqbQlwk-UOi6IDUTJpDhCnf0UJyB9EcG2CgE6b8KzJAV_74B2OhKh5XXXc8leamwqKSzeAIw6NeufzhCqltw-h96xJpZrHbkDu32CZGt09NiwaoNwB33lWbkJOfWJmt8XljH3LeasCS9yPbM",
    },
  ];

  const stockProducts: StockProduct[] = [
    {
      name: "Premium Pellets (50kg)",
      sku: "SKU-8821",
      quantity: "5 Left",
      color: "#ba1a1a",
    },
    {
      name: "O2 Sensor Pro",
      sku: "SKU-1120",
      quantity: "2 Left",
      color: "#ba1a1a",
    },
  ];

  const progressData = [
    { label: "Delivered", value: 640, percentage: 72, color: "#003a4d" },
    { label: "In Transit", value: 320, percentage: 45, color: "#1f6581" },
    { label: "Pending", value: 280, percentage: 30, color: "#c0c8cd" },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4faff", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#003a4d",
              fontFamily: '"Manrope", sans-serif',
              letterSpacing: "-0.01em",
            }}
          >
            Enterprise Overview
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#40484c", mt: 0.5 }}>
            Real-time performance metrics for aquaculture logistics.
          </Typography>
        </Box>

        {/* Date Filter Buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#e8f6fe",
            p: 0.5,
            borderRadius: 1,
          }}
        >
          {["Today", "Week", "Month"].map((period) => (
            <Button
              key={period}
              onClick={() => setTimeFilter(period.toLowerCase())}
              sx={{
                px: 2,
                py: 1,
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "6px",
                backgroundColor:
                  timeFilter === period.toLowerCase()
                    ? "#ffffff"
                    : "transparent",
                color:
                  timeFilter === period.toLowerCase() ? "#003a4d" : "#40484c",
                boxShadow:
                  timeFilter === period.toLowerCase()
                    ? "0 2px 4px rgba(0, 58, 77, 0.06)"
                    : "none",
                "&:hover": {
                  backgroundColor:
                    timeFilter === period.toLowerCase()
                      ? "#ffffff"
                      : "#d7e5ed",
                },
              }}
            >
              {period}
            </Button>
          ))}
          <Divider
            orientation="vertical"
            sx={{ height: 20, borderColor: "#c0c8cd", mx: 0.5 }}
          />
          <IconButton
            size="small"
            sx={{
              color: "#40484c",
              "&:hover": { backgroundColor: "#d7e5ed" },
            }}
          >
            <CalendarToday sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Card
              sx={{
                p: 3,
                backgroundColor: "#ffffff",
                border: "1px solid #d7e5ed88",
                boxShadow: "0 4px 20px rgba(0, 58, 77, 0.03)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#70787d",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {kpi.label}
                </Typography>
                {kpi.badge && (
                  <Chip
                    label={kpi.badge.text}
                    sx={{
                      backgroundColor: kpi.badge.bgColor,
                      color: kpi.badge.textColor,
                      fontSize: "10px",
                      fontWeight: 700,
                      height: 18,
                    }}
                  />
                )}
                {kpi.icon && <Box>{kpi.icon}</Box>}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography
                  sx={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#111d23",
                    fontFamily: '"Manrope", sans-serif',
                  }}
                >
                  {kpi.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#70787d",
                    mt: 0.5,
                  }}
                >
                  {kpi.subtitle}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              p: 4,
              backgroundColor: "#ffffff",
              border: "1px solid #d7e5ed88",
              boxShadow: "0 4px 20px rgba(0, 58, 77, 0.03)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#003a4d",
                    fontFamily: '"Manrope", sans-serif',
                  }}
                >
                  Sales Trend
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#70787d" }}>
                  Revenue performance over time
                </Typography>
              </Box>
              <Button
                endIcon={<TrendingUp sx={{ fontSize: 16 }} />}
                sx={{
                  color: "#003a4d",
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "none",
                }}
              >
                View Report
              </Button>
            </Box>
            <Box
              sx={{
                height: 256,
                backgroundColor: "#f4faff",
                borderRadius: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                p: 2,
              }}
            >
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                (day, idx) => (
                  <Box key={day} sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 8,
                        height: `${40 + idx * 25}px`,
                        backgroundColor: "#003a4d",
                        borderRadius: "6px 6px 0 0",
                        mb: 1,
                      }}
                    />
                    <Typography sx={{ fontSize: "10px", color: "#70787d" }}>
                      {day}
                    </Typography>
                  </Box>
                )
              )}
            </Box>
          </Card>
        </Grid>

        {/* Order Distribution */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              p: 4,
              backgroundColor: "#ffffff",
              border: "1px solid #d7e5ed88",
              boxShadow: "0 4px 20px rgba(0, 58, 77, 0.03)",
            }}
          >
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#003a4d",
                fontFamily: '"Manrope", sans-serif',
                mb: 1,
              }}
            >
              Order Distribution
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#70787d", mb: 3 }}>
              Current status breakdown
            </Typography>

            {progressData.map((item) => (
              <Box key={item.label} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#70787d" }}>
                    {item.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    backgroundColor: "#e2f0f8",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 3, borderColor: "#d7e5ed" }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#9eddfd44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Verified sx={{ fontSize: 20, color: "#1f6581" }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "10px", fontWeight: 700 }}>
                  Fulfillment Rate
                </Typography>
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#003a4d",
                    fontFamily: '"Manrope", sans-serif',
                  }}
                >
                  94.2%
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Lower Section: Table & Panels */}
      <Grid container spacing={3}>
        {/* Recent Orders Table */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              border: "1px solid #d7e5ed88",
              boxShadow: "0 4px 20px rgba(0, 58, 77, 0.03)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3, display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#003a4d",
                  fontFamily: '"Manrope", sans-serif',
                }}
              >
                Recent Orders
              </Typography>
              <Button
                sx={{
                  color: "#003a4d",
                  fontWeight: 600,
                  fontSize: "12px",
                  textDecoration: "underline",
                  textTransform: "none",
                }}
              >
                See All Orders
              </Button>
            </Box>

            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#e8f6fe",
                  borderBottom: "1px solid #d7e5ed",
                }}
              >
                <TableRow>
                  {["ID", "Customer", "Date", "Amount", "Status"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#70787d",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          px: 3,
                          py: 2,
                        }}
                      >
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    sx={{
                      borderBottom: "1px solid #f0f4f8",
                      "&:hover": { backgroundColor: "#f0f6fb" },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#003a4d",
                        px: 3,
                        py: 2,
                      }}
                    >
                      {order.id}
                    </TableCell>
                    <TableCell sx={{ px: 3, py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: order.avatarBg,
                            width: 32,
                            height: 32,
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#003a4d",
                          }}
                        >
                          {order.initials}
                        </Avatar>
                        <Typography sx={{ fontSize: "12px" }}>
                          {order.customer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "12px", color: "#70787d", px: 3, py: 2 }}
                    >
                      {order.date}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        px: 3,
                        py: 2,
                      }}
                    >
                      {order.amount}
                    </TableCell>
                    <TableCell sx={{ px: 3, py: 2 }}>
                      <Chip
                        label={order.status}
                        sx={{
                          backgroundColor: order.statusBg,
                          color: order.statusColor,
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Side Panels */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Low Stock Products */}
            <Card
              sx={{
                p: 3,
                backgroundColor: "#e8f6fe",
                border: "1px solid #d7e5ed88",
                boxShadow: "0 4px 20px rgba(0, 58, 77, 0.03)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Warning sx={{ fontSize: 20, color: "#ba1a1a" }} />
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#003a4d",
                    fontFamily: '"Manrope", sans-serif',
                  }}
                >
                  Low Stock Products
                </Typography>
              </Box>

              {stockProducts.map((product, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 2,
                    backgroundColor: "#ffffff",
                    borderRadius: 1,
                    mb: idx === stockProducts.length - 1 ? 0 : 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "#70787d" }}>
                      Ref: {product.sku}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: product.color,
                      }}
                    >
                      {product.quantity}
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#003a4d",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      Restock
                    </Button>
                  </Box>
                </Box>
              ))}
            </Card>

            {/* Top Customers */}
            <Card
              sx={{
                p: 3,
                backgroundColor: "#ffffff",
                border: "1px solid #d7e5ed88",
                boxShadow: "0 4px 20px rgba(0, 58, 77, 0.03)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#003a4d",
                  fontFamily: '"Manrope", sans-serif',
                  mb: 3,
                }}
              >
                Top Customers
              </Typography>

              {topCustomers.map((customer, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={customer.image}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                        {customer.name}
                      </Typography>
                      <Typography sx={{ fontSize: "10px", color: "#70787d" }}>
                        {customer.orders}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#003a4d",
                      }}
                    >
                      {customer.revenue}
                    </Typography>
                  </Box>
                  {idx !== topCustomers.length - 1 && (
                    <Divider sx={{ my: 2, borderColor: "#d7e5ed" }} />
                  )}
                </Box>
              ))}

              <Button
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  backgroundColor: "#ddeaf3",
                  color: "#003a4d",
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "none",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#d7e5ed" },
                }}
              >
                Customer Insight Portal
              </Button>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
