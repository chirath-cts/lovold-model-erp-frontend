import { useMemo, useState } from "react";
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
import { customerProductsService } from "@/services/endpoints/customerProductsService";
import {
  useCustomerProducts,
  useCustomers,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { FilterBar } from "@/shared/ui/FilterBar";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const EMPTY_ARRAY: never[] = [];

export function DiscountsPage() {
  const [status, setStatus] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(plusDays(30));
  const [isActive, setIsActive] = useState(true);

  const customerProductsQuery = useCustomerProducts({ status });
  const customersQuery = useCustomers();
  const productsQuery = useProducts();

  const customerProducts = customerProductsQuery.data ?? EMPTY_ARRAY;
  const customers = customersQuery.data ?? EMPTY_ARRAY;
  const products = productsQuery.data ?? EMPTY_ARRAY;

  const customerLookup = useMemo(
    () => new Map(customers.map((item) => [item.id, item.companyName])),
    [customers],
  );
  const productLookup = useMemo(
    () => new Map(products.map((item) => [item.id, item.name])),
    [products],
  );

  const rows = customerProducts.map((customerProduct) => ({
    ...customerProduct,
    customerName: customerLookup.get(customerProduct.customerId) ?? "-",
    productName: productLookup.get(customerProduct.productId) ?? "-",
  }));

  const resetForm = () => {
    setCustomerId(customers[0]?.id ?? "");
    setProductId(products[0]?.id ?? "");
    setDiscountPercent(0);
    setStartDate(today());
    setEndDate(plusDays(30));
    setIsActive(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      customerProductsService.create({
        customerId,
        productId,
        discountPercent,
        startDate: startDate || null,
        endDate: endDate || null,
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerProducts });
      setOpenModal(false);
      resetForm();
    },
  });

  if (
    customerProductsQuery.isLoading ||
    customersQuery.isLoading ||
    productsQuery.isLoading
  ) {
    return <LoadingState label="Loading customer pricing..." />;
  }

  if (customerProductsQuery.error || customersQuery.error || productsQuery.error) {
    return <ErrorState message="Failed to load customer pricing." />;
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h1">Customer Pricing</Typography>
          <Typography variant="body2" color="text.secondary">
            Product-specific pricing agreements by customer.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setOpenModal(true);
          }}
        >
          Create Agreement
        </Button>
      </Box>

      <FilterBar>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(event) => setStatus(event.target.value)}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="future">Future</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      <DataTable
        rows={rows}
        rowKey={(row) => `${row.customerId}__${row.productId}`}
        columns={[
          {
            key: "customer",
            header: "Customer",
            render: (row) => row.customerName,
          },
          {
            key: "product",
            header: "Product",
            render: (row) => row.productName,
          },
          {
            key: "discountPercent",
            header: "Discount",
            align: "right",
            render: (row) => `${row.discountPercent}%`,
          },
          {
            key: "validity",
            header: "Validity",
            render: (row) =>
              `${row.startDate ?? "-"} to ${row.endDate ?? "-"}`,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Create Customer Pricing Agreement</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <FormControl size="small">
              <InputLabel>Customer</InputLabel>
              <Select
                value={customerId}
                label="Customer"
                onChange={(event) => setCustomerId(event.target.value)}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Product</InputLabel>
              <Select
                value={productId}
                label="Product"
                onChange={(event) => setProductId(event.target.value)}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Discount percent"
              size="small"
              type="number"
              inputProps={{ min: 0, step: "any" }}
              value={discountPercent}
              onChange={(event) => setDiscountPercent(Number(event.target.value))}
            />

            <FormControl size="small">
              <InputLabel>Agreement State</InputLabel>
              <Select
                value={isActive ? "active" : "inactive"}
                label="Agreement State"
                onChange={(event) => setIsActive(event.target.value === "active")}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

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
            disabled={
              !customerId ||
              !productId ||
              discountPercent < 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
