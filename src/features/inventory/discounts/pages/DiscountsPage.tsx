import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { queryClient } from "@/app/queryClient";
import { discountsService } from "@/services/endpoints/discountsService";
import {
  useCategories,
  useCustomers,
  useDiscounts,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { FilterBar } from "@/shared/ui/FilterBar";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export function DiscountsPage() {
  const [status, setStatus] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [scopeType, setScopeType] = useState<"product" | "category">("product");
  const [scopeId, setScopeId] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const discountsQuery = useDiscounts({ status });
  const customersQuery = useCustomers();
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();

  const discounts = discountsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      discountsService.create({
        id: `dsc-${crypto.randomUUID().slice(0, 8)}`,
        name,
        customerId,
        scopeType,
        scopeId,
        discountType,
        value,
        currency: "NOK",
        startDate,
        endDate,
        status: "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts });
      setOpenModal(false);
      setName("");
      setValue(0);
    },
  });

  if (
    discountsQuery.isLoading ||
    customersQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading
  ) {
    return <LoadingState label="Loading discounts..." />;
  }

  if (discountsQuery.error || customersQuery.error || productsQuery.error || categoriesQuery.error) {
    return <ErrorState message="Failed to load discounts." />;
  }

  const customerLookup = new Map(customers.map((item) => [item.id, item.companyName]));
  const productLookup = new Map(products.map((item) => [item.id, item.name]));
  const categoryLookup = new Map(categories.map((item) => [item.id, item.name]));

  const rows = discounts.map((discount) => ({
    ...discount,
    customerName: customerLookup.get(discount.customerId) ?? "-",
    scopeName:
      discount.scopeType === "product"
        ? (productLookup.get(discount.scopeId) ?? "Unknown Product")
        : (categoryLookup.get(discount.scopeId) ?? "Unknown Category"),
  }));

  const scopeOptions = (scopeType === "product" ? products : categories).map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h1">Campaign Discounts</Typography>
          <Typography variant="body2" color="text.secondary">
            Customer-specific pricing campaigns used during order creation.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setOpenModal(true);
            setCustomerId(customers[0]?.id ?? "");
            setScopeId(products[0]?.id ?? "");
          }}
        >
          Create Discount
        </Button>
      </Box>

      <FilterBar>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(event) => setStatus(event.target.value)}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="future">Future</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "name",
            header: "Campaign",
            render: (row) => (
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.name}
              </Typography>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            render: (row) => row.customerName,
          },
          {
            key: "scope",
            header: "Scope",
            render: (row) => `${row.scopeType}: ${row.scopeName}`,
          },
          {
            key: "value",
            header: "Value",
            align: "right",
            render: (row) =>
              row.discountType === "percentage"
                ? `${row.value}%`
                : `${row.value.toLocaleString("nb-NO")} NOK`,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Create Discount</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <TextField
              sx={{ gridColumn: { md: "span 2" } }}
              label="Campaign name"
              size="small"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <FormControl size="small">
              <InputLabel>Customer</InputLabel>
              <Select value={customerId} label="Customer" onChange={(event) => setCustomerId(event.target.value)}>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Discount Type</InputLabel>
              <Select
                value={discountType}
                label="Discount Type"
                onChange={(event) => setDiscountType(event.target.value as "percentage" | "fixed")}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Scope Type</InputLabel>
              <Select
                value={scopeType}
                label="Scope Type"
                onChange={(event) => {
                  const nextScope = event.target.value as "product" | "category";
                  setScopeType(nextScope);
                  setScopeId((nextScope === "product" ? products[0]?.id : categories[0]?.id) ?? "");
                }}
              >
                <MenuItem value="product">Product scope</MenuItem>
                <MenuItem value="category">Category scope</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Scope</InputLabel>
              <Select value={scopeId} label="Scope" onChange={(event) => setScopeId(event.target.value)}>
                {scopeOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Discount value"
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
            />

            <TextField
              label="Start date"
              size="small"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End date"
              size="small"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!name || !customerId || !scopeId || createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
