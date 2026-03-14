import { useMemo } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { queryClient } from "@/app/queryClient";
import { createOrderSchema, type CreateOrderFormValues } from "@/features/orders/model/createOrderSchema";
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

  const { control, handleSubmit, watch, reset } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedCustomerId = watch("customerId");
  const watchedLines = watch("lines");

  const lineSummaries = useMemo(
    () =>
      watchedLines.map((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product) {
          return {
            lineSubtotal: 0,
            discountAmount: 0,
            lineTotal: 0,
            lineProfit: 0,
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
    [products, watchedLines],
  );

  const totals = useMemo(
    () =>
      lineSummaries.reduce(
        (acc, line) => ({
          subtotal: acc.subtotal + line.lineSubtotal,
          discount: acc.discount + line.discountAmount,
          total: acc.total + line.lineTotal,
          profit: acc.profit + line.lineProfit,
        }),
        { subtotal: 0, discount: 0, total: 0, profit: 0 },
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-[#003a4d]">New Sales Order</h3>
            <p className="text-sm text-slate-500">Create a confirmed order and update stock instantly.</p>
          </div>
          <button className="rounded-full p-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <CloseRoundedIcon />
          </button>
        </div>

        <form className="space-y-6 p-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</span>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <select {...field} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </option>
                    ))}
                  </select>
                )}
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order date</span>
              <Controller
                control={control}
                name="orderDate"
                render={({ field }) => <input {...field} type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Order lines</h4>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700"
                onClick={() =>
                  append({
                    productId: products[0]?.id ?? "",
                    quantity: 1,
                    discountType: "percentage",
                    discountValue: 0,
                  })
                }
              >
                <AddRoundedIcon sx={{ fontSize: 18 }} /> Add line
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedProduct = products.find((item) => item.id === watchedLines[index]?.productId);
                const matchingDiscounts = discounts.filter(
                  (discount) =>
                    discount.customerId === selectedCustomerId &&
                    discount.status === "active" &&
                    selectedProduct &&
                    ((discount.scopeType === "product" && discount.scopeId === selectedProduct.id) ||
                      (discount.scopeType === "category" && discount.scopeId === selectedProduct.categoryId)),
                );

                return (
                  <div key={field.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <Controller
                        control={control}
                        name={`lines.${index}.productId`}
                        render={({ field: lineField }) => (
                          <select {...lineField} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Controller
                        control={control}
                        name={`lines.${index}.quantity`}
                        render={({ field: lineField }) => (
                          <input
                            {...lineField}
                            type="number"
                            min={1}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            onChange={(event) => lineField.onChange(Number(event.target.value))}
                          />
                        )}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Controller
                        control={control}
                        name={`lines.${index}.discountType`}
                        render={({ field: lineField }) => (
                          <select {...lineField} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                            <option value="percentage">%</option>
                            <option value="fixed">NOK</option>
                          </select>
                        )}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Controller
                        control={control}
                        name={`lines.${index}.discountValue`}
                        render={({ field: lineField }) => (
                          <input
                            {...lineField}
                            type="number"
                            min={0}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            onChange={(event) => lineField.onChange(Number(event.target.value))}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-end lg:col-span-2">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-white"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <DeleteRoundedIcon />
                      </button>
                    </div>

                    <div className="lg:col-span-12">
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                        <span>
                          Unit Price: <CurrencyText value={selectedProduct?.unitPrice ?? 0} />
                        </span>
                        <span>
                          Line Total: <CurrencyText value={lineSummaries[index]?.lineTotal ?? 0} />
                        </span>
                        <span>
                          Profit: <CurrencyText value={lineSummaries[index]?.lineProfit ?? 0} />
                        </span>
                      </div>
                      {matchingDiscounts.length > 0 ? (
                        <p className="mt-1 text-xs text-[#00526C]">
                          Matching active discounts: {matchingDiscounts.map((item) => item.name).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#00526C]/20 bg-[#00526C]/5 p-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                Subtotal: <CurrencyText className="font-semibold" value={totals.subtotal} />
              </p>
              <p>
                Discount: <CurrencyText className="font-semibold" value={totals.discount} />
              </p>
              <p>
                Total: <CurrencyText className="font-semibold" value={totals.total} />
              </p>
              <p>
                Estimated Profit: <CurrencyText className="font-semibold" value={totals.profit} />
              </p>
            </div>
          </div>

          {mutation.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to create order."}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#00526C] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
