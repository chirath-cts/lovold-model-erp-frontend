import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Avatar, Box, Button, Chip, Grid, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";

import { buildCustomerAggregates } from "@/features/customers/model/customerSelectors";
import { useCustomers, useOrders } from "@/services/hooks/useDomainQueries";
import { formatDate } from "@/shared/lib/format";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";

const Eyebrow = styled(Typography)(({ theme }) => ({
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: 12,
  fontWeight: 700,
  padding: theme.spacing(1.25, 2.75),
}));

const PrimaryGradientButton = styled(ActionButton)(({ theme }) => ({
  backgroundImage: "linear-gradient(135deg, #003a4d 0%, #00526c 100%)",
  color: theme.palette.common.white,
  boxShadow: "0 12px 28px rgba(0, 58, 77, 0.25)",
  "&:hover": {
    backgroundImage: "linear-gradient(135deg, #002a38 0%, #00435a 100%)",
  },
}));

const FilterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  borderRadius: 12,
  boxShadow: "0 12px 32px rgba(0, 58, 77, 0.08)",
}));

const FilterField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.common.white,
    borderRadius: 12,
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: theme.palette.divider },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
    "& .MuiOutlinedInput-input": {
      padding: theme.spacing(1.5, 1.5),
    },
    "& .MuiSelect-select": {
      padding: theme.spacing(1.5, 1.5),
    },
  },
}));

const StatusPill = styled(Chip)(({ theme }) => ({
  borderRadius: 999,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  height: 28,
  "& .MuiChip-label": { paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1) },
}));

const CodeText = styled(Typography)(({ theme }) => ({
  fontFamily: "'IBM Plex Mono', 'SFMono-Regular', 'Consolas', monospace",
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

const AvatarAccent = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  fontWeight: 700,
  fontSize: "0.85rem",
}));

const InsightCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "tone",
})<{ tone: "primary" | "secondary" | "surface" }>(({ theme, tone }) => {
  const palette =
    tone === "primary"
      ? { bg: theme.palette.primary.main, fg: theme.palette.common.white }
      : tone === "secondary"
        ? { bg: theme.palette.secondary.light, fg: theme.palette.secondary.contrastText }
        : { bg: theme.palette.background.paper, fg: theme.palette.text.primary };

  return {
    position: "relative",
    overflow: "hidden",
    borderRadius: 14,
    padding: theme.spacing(3.5),
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    backgroundColor: palette.bg,
    color: palette.fg,
    boxShadow: "0 18px 40px rgba(0, 58, 77, 0.12)",
    minHeight: 180,
  };
});

const toInitials = (name?: string) =>
  name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "CU"
    : "CU";

const getCountryFromAddress = (address?: string) => {
  if (!address) return "-";
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const last = parts[parts.length - 1];
  return last || address;
};

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const theme = useTheme();
  const customersQuery = useCustomers();
  const ordersQuery = useOrders();

  const customers = customersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  const aggregateLookup = new Map(
    buildCustomerAggregates(customers, orders).map((item) => [item.customerId, item]),
  );
  const totalSales = orders.reduce((sum, order) => sum + order.grandTotal, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;

  const countryOptions = useMemo(() => {
    const values = new Set<string>();
    customers.forEach((customer) => {
      const country = getCountryFromAddress(customer.address);
      if (country && country !== "-") {
        values.add(country);
      }
    });
    return Array.from(values).sort();
  }, [customers]);

  const rows = customers.filter((customer) => {
    const haystack = [customer.name, customer.customerCode, customer.email, customer.phone, customer.address]
      .join(" ")
      .toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesCountry = countryFilter === "all" || getCountryFromAddress(customer.address) === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  if (customersQuery.isLoading || ordersQuery.isLoading) {
    return <LoadingState label="Loading customers..." />;
  }

  if (customersQuery.error || ordersQuery.error) {
    return <ErrorState message="Failed to load customers." />;
  }

  const renderStatus = (status: string) => {
    const key = status?.toLowerCase() ?? "";
    const palette =
      {
        active: { bg: alpha(theme.palette.secondary.main, 0.18), color: theme.palette.secondary.main },
        inactive: { bg: theme.palette.grey[200], color: theme.palette.text.secondary },
      }[key] ?? { bg: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main };

    return (
      <StatusPill
        label={status ? status.toUpperCase() : "-"}
        size="small"
        sx={{ bgcolor: palette.bg, color: palette.color }}
      />
    );
  };

  return (
    <Stack spacing={3.5} p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
        <Box>
          <Eyebrow>Partnership Directory</Eyebrow>
          <Typography variant="h1" color="primary">
            Customer Network
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Commercial view of customer names, contact details, sales, and order performance.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <ActionButton variant="outlined" startIcon={<DownloadRoundedIcon />}>
            Export Data
          </ActionButton>
          <PrimaryGradientButton variant="contained" startIcon={<PersonAddRoundedIcon />}>
            Add Customer
          </PrimaryGradientButton>
        </Stack>
      </Box>

      <FilterCard>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6} lg={4}>
            <Eyebrow component="label" htmlFor="customer-search">
              Search Database
            </Eyebrow>
            <FilterField
              id="customer-search"
              placeholder="By company, person, or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Eyebrow component="label" htmlFor="status-filter">
              Lifecycle Status
            </Eyebrow>
            <FilterField
              id="status-filter"
              select
              fullWidth
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </FilterField>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Eyebrow component="label" htmlFor="country-filter">
              Region
            </Eyebrow>
            <FilterField
              id="country-filter"
              select
              fullWidth
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
            >
              <MenuItem value="all">All regions</MenuItem>
              {countryOptions.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </FilterField>
          </Grid>
          <Grid item xs={12} lg={2} display="flex" alignItems="flex-end">
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCountryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </FilterCard>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        pageSize={5}
        entityLabel="enterprise accounts"
        columns={[
          {
            key: "code",
            header: "Customer Code",
            render: (row) => <CodeText variant="body2">#{row.customerCode}</CodeText>,
          },
          {
            key: "company",
            header: "Company Name",
            render: (row) => (
              <Box display="flex" alignItems="center" gap={2}>
                <AvatarAccent variant="rounded">{toInitials(row.name)}</AvatarAccent>
                <Typography variant="subtitle1" fontWeight={700} color="primary">
                  {row.name}
                </Typography>
              </Box>
            ),
          },
          {
            key: "contact",
            header: "Key Contact",
            render: (row) => (
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {row.email || "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.phone || "-"}
                </Typography>
              </Box>
            ),
          },
          {
            key: "country",
            header: "Country",
            align: "center",
            render: (row) => <Typography variant="body2">{getCountryFromAddress(row.address)}</Typography>,
          },
          {
            key: "orders",
            header: "Orders",
            align: "right",
            render: (row) => (
              <Typography variant="body2" fontWeight={700} color="primary">
                {aggregateLookup.get(row.id)?.totalOrders ?? 0}
              </Typography>
            ),
          },
          {
            key: "revenue",
            header: "Revenue",
            align: "right",
            render: (row) => (
              <Typography variant="body2" fontWeight={700} color="primary">
                <CurrencyText value={aggregateLookup.get(row.id)?.totalSales ?? 0} />
              </Typography>
            ),
          },
          {
            key: "lastOrder",
            header: "Last Order",
            render: (row) => {
              const lastOrderDate = aggregateLookup.get(row.id)?.lastOrderDate;
              return (
                <Typography variant="body2" color="text.secondary">
                  {lastOrderDate ? formatDate(lastOrderDate) : "-"}
                </Typography>
              );
            },
          },
          {
            key: "status",
            header: "Status",
            render: (row) => renderStatus(row.status),
          },
          {
            key: "action",
            header: "",
            align: "right",
            render: (row) => (
              <Button
                size="small"
                variant="text"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ fontWeight: 700 }}
                component={RouterLink}
                to={`/customers/${row.id}`}
              >
                View
              </Button>
            ),
          },
        ]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <InsightCard tone="primary">
            <Box position="absolute" right={-12} bottom={-12} sx={{ opacity: 0.08 }}>
              <GroupsRoundedIcon sx={{ fontSize: 140 }} />
            </Box>
            <Eyebrow color="inherit" sx={{ opacity: 0.9 }}>
              Network Growth
            </Eyebrow>
            <Typography variant="h3" fontWeight={800} color="inherit">
              {customers.length} Customers
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Active relationships across the directory.
            </Typography>
          </InsightCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <InsightCard tone="surface">
            <Box position="absolute" right={-12} bottom={-12} sx={{ opacity: 0.08 }}>
              <ShowChartRoundedIcon sx={{ fontSize: 140 }} color="primary" />
            </Box>
            <Eyebrow color="primary" sx={{ opacity: 0.8 }}>
              Revenue Quality
            </Eyebrow>
            <Typography variant="h3" fontWeight={800} color="primary">
              <CurrencyText value={avgOrderValue} /> avg / order
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on {totalOrders} recorded orders.
            </Typography>
          </InsightCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <InsightCard tone="secondary">
            <Box position="absolute" right={-12} bottom={-12} sx={{ opacity: 0.08 }}>
              <PublicRoundedIcon sx={{ fontSize: 140 }} />
            </Box>
            <Eyebrow color="inherit" sx={{ opacity: 0.9 }}>
              Global Reach
            </Eyebrow>
            <Typography variant="h3" fontWeight={800} color="inherit">
              {countryOptions.length || 1} Regions
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Distinct countries represented in the directory.
            </Typography>
          </InsightCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
