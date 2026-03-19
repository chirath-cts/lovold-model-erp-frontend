import { useCallback, useEffect, useMemo, useRef } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { queryClient } from "@/app/queryClient";
import {
  createOrderSchema,
  type CreateOrderFormValues,
} from "@/features/orders/model/createOrderSchema";
import { createOrderWorkflow } from "@/features/orders/services/createOrderWorkflow";
import { queryKeys } from "@/shared/constants/queryKeys";
import { computeLineTotals } from "@/shared/lib/orderCalculations";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import type { Customer, Discount, Order, Product } from "@/shared/types/domain";

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  discounts: Discount[];
  orders: Order[];
}

export function CreateOrderModal({
  open,
  onClose,
  products,
  customers,
  discounts,
  orders,
}: CreateOrderModalProps) {
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: customers[0]?.id ?? "",
      orderDate: new Date().toISOString().slice(0, 10),
      lines: [
        {
          productId: products[0]?.id ?? "",
          quantity: 1,
          discountType: "percentage",
          discountValue: 0,
        },
      ],
    },
  });

  const { control, handleSubmit, reset, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedCustomerId = useWatch({ control, name: "customerId" });
  const watchedLines = useWatch({
    control,
    name: "lines",
    defaultValue: [],
  });

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const activeDiscounts = useMemo(
    () =>
      discounts.filter(
        (discount) =>
          discount.customerId === selectedCustomerId && discount.status === "active",
      ),
    [discounts, selectedCustomerId],
  );

  const discountsByProduct = useMemo(() => {
    const map = new Map<string, Discount>();
    activeDiscounts.forEach((discount) => {
      if (discount.scopeType === "product") {
        map.set(discount.scopeId, discount);
      }
    });
    return map;
  }, [activeDiscounts]);

  const discountsByCategory = useMemo(() => {
    const map = new Map<string, Discount>();
    activeDiscounts.forEach((discount) => {
      if (discount.scopeType === "category") {
        map.set(discount.scopeId, discount);
      }
    });
    return map;
  }, [activeDiscounts]);

  const getDiscountForProduct = useCallback(
    (product?: Product) => {
      if (!product) return undefined;
      return (
        discountsByProduct.get(product.id) ??
        discountsByCategory.get(product.categoryId)
      );
    },
    [discountsByCategory, discountsByProduct],
  );

  const applyDiscountToLine = useCallback(
    (lineIndex: number, productId?: string) => {
      const product = productId ? productsById.get(productId) : undefined;
      const matchedDiscount = getDiscountForProduct(product);

      const nextDiscountType = matchedDiscount?.discountType ?? "percentage";
      const nextDiscountValue = matchedDiscount?.value ?? 0;

      setValue(`lines.${lineIndex}.discountType`, nextDiscountType, {
        shouldDirty: true,
      });
      setValue(`lines.${lineIndex}.discountValue`, nextDiscountValue, {
        shouldDirty: true,
      });
    },
    [getDiscountForProduct, productsById, setValue],
  );

  const getMatchingDiscounts = useCallback(
    (product?: Product) => {
      if (!product) return [] as Discount[];
      return activeDiscounts.filter(
        (discount) =>
          (discount.scopeType === "product" && discount.scopeId === product.id) ||
          (discount.scopeType === "category" && discount.scopeId === product.categoryId),
      );
    },
    [activeDiscounts],
  );

  const previousCustomerIdRef = useRef<string | undefined>(undefined);
  const previousProductIdsRef = useRef<string[]>([]);
  const previousDiscountSignatureRef = useRef<string>("");

  useEffect(() => {
    const discountSignature = activeDiscounts
      .map((item) => `${item.id}:${item.discountType}:${item.value}`)
      .join("|");
    const discountsChanged = previousDiscountSignatureRef.current !== discountSignature;
    const customerChanged = previousCustomerIdRef.current !== selectedCustomerId;

    watchedLines.forEach((line, index) => {
      const prevProductId = previousProductIdsRef.current[index];
      const productChanged = prevProductId !== line?.productId;

      const shouldUpdateLine = customerChanged || productChanged || discountsChanged;
      if (!shouldUpdateLine) return;

      applyDiscountToLine(index, line?.productId);
    });

    previousCustomerIdRef.current = selectedCustomerId;
    previousProductIdsRef.current = watchedLines.map((line) => line.productId);
    previousDiscountSignatureRef.current = discountSignature;
  }, [
    activeDiscounts,
    applyDiscountToLine,
    selectedCustomerId,
    watchedLines,
  ]);

  const lineSummaries = useMemo(
    () =>
      watchedLines.map((line) => {
        const product = productsById.get(line.productId);
        if (!product) {
          return {
            lineSubtotal: 0,
            discountAmount: 0,
            lineTotal: 0,
            profitAmount: 0,
          };
        }

        return computeLineTotals({
          unitPrice: product.unitPrice,
          fixedCostPrice: product.fixedCostPrice,
          quantity: line.quantity,
          discountType: line.discountType,
          discountValue: line.discountValue,
        });
      }),
    [productsById, watchedLines],
  );

  const totals = useMemo(
    () =>
      lineSummaries.reduce(
        (acc, line) => ({
          subtotal: acc.subtotal + line.lineSubtotal,
          discountTotal: acc.discountTotal + line.discountAmount,
          grandTotal: acc.grandTotal + line.lineTotal,
          profitTotal: acc.profitTotal + line.profitAmount,
        }),
        { subtotal: 0, discountTotal: 0, grandTotal: 0, profitTotal: 0 },
      ),
    [lineSummaries],
  );

  const mutation = useMutation({
    mutationFn: (values: CreateOrderFormValues) =>
      createOrderWorkflow({
        values,
        customers,
        products,
        discounts,
        existingOrders: orders,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.orderItems });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      reset();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h2">New Sales Order</Typography>
        <Typography variant="body2" color="text.secondary">
          Create a confirmed order and update stock instantly.
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
          aria-label="close"
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Customer</InputLabel>
                  <Select {...field} label="Customer">
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="orderDate"
              render={({ field }) => (
                <TextField {...field} size="small" fullWidth label="Order Date" type="date" InputLabelProps={{ shrink: true }} />
              )}
            />
          </Box>

          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Order Lines
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() =>
                  append({
                    productId: products[0]?.id ?? "",
                    quantity: 1,
                    discountType: "percentage",
                    discountValue: 0,
                  })
                }
              >
                Add line
              </Button>
            </Box>

            {fields.map((field, index) => {
              const selectedProduct = productsById.get(watchedLines[index]?.productId ?? "");
              const matchingDiscounts = getMatchingDiscounts(selectedProduct);

              return (
                <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        lg: "3fr 1fr 1fr 1fr auto",
                      },
                      alignItems: "center",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`lines.${index}.productId`}
                      render={({ field: lineField }) => (
                        <FormControl size="small" fullWidth sx={{ gridColumn: { xs: "span 2", lg: "span 1" } }}>
                          <InputLabel>Product</InputLabel>
                          <Select
                            {...lineField}
                            label="Product"
                            onChange={(event) => {
                              const value = event.target.value as string;
                              lineField.onChange(value);
                              applyDiscountToLine(index, value);
                            }}
                          >
                            {products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`lines.${index}.quantity`}
                      render={({ field: lineField }) => (
                        <TextField
                          {...lineField}
                          size="small"
                          label="Qty"
                          type="number"
                          inputProps={{ min: 1 }}
                          onChange={(event) => lineField.onChange(Number(event.target.value))}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name={`lines.${index}.discountType`}
                      render={({ field: lineField }) => (
                        <FormControl size="small" fullWidth>
                          <InputLabel>Disc Type</InputLabel>
                          <Select {...lineField} label="Disc Type">
                            <MenuItem value="percentage">%</MenuItem>
                            <MenuItem value="fixed">NOK</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`lines.${index}.discountValue`}
                      render={({ field: lineField }) => (
                        <TextField
                          {...lineField}
                          size="small"
                          label="Disc Value"
                          type="number"
                          inputProps={{ min: 0, step: "any" }}
                          onChange={(event) => lineField.onChange(Number(event.target.value))}
                        />
                      )}
                    />

                    <IconButton
                      aria-label="delete"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Unit Price: <CurrencyText value={selectedProduct?.unitPrice ?? 0} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Line Total: <CurrencyText value={lineSummaries[index]?.lineTotal ?? 0} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Profit: <CurrencyText value={lineSummaries[index]?.profitAmount ?? 0} />
                    </Typography>
                  </Box>

                  {matchingDiscounts.length > 0 ? (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block" }}>
                      Matching active discounts: {matchingDiscounts.map((item) => item.name).join(", ")}
                    </Typography>
                  ) : null}
                </Paper>
              );
            })}
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: "rgba(0, 82, 108, 0.05)", borderColor: "primary.light" }}>
            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              }}
            >
              <Typography variant="body2">
                Subtotal: <strong><CurrencyText value={totals.subtotal} /></strong>
              </Typography>
              <Typography variant="body2">
                Discount: <strong><CurrencyText value={totals.discountTotal} /></strong>
              </Typography>
              <Typography variant="body2">
                Grand Total: <strong><CurrencyText value={totals.grandTotal} /></strong>
              </Typography>
              <Typography variant="body2">
                Profit: <strong><CurrencyText value={totals.profitTotal} /></strong>
              </Typography>
            </Box>
          </Paper>

          {mutation.error ? (
            <Alert severity="error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Failed to create order."}
            </Alert>
          ) : null}

          <DialogActions sx={{ px: 0 }}>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Order"}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
