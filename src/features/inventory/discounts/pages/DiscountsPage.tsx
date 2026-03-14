import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/queryClient";
import { discountsService } from "@/services/endpoints/discountsService";
import { useCategories, useCustomers, useDiscounts, useProducts } from "@/services/hooks/useDomainQueries";
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#003a4d]">Campaign Discounts</h1>
          <p className="text-sm text-slate-500">Customer-specific pricing campaigns used during order creation.</p>
        </div>
        <button
          className="rounded-lg bg-[#00526C] px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setOpenModal(true);
            setCustomerId(customers[0]?.id ?? "");
            setScopeId(products[0]?.id ?? "");
          }}
        >
          Create Discount
        </button>
      </div>

      <FilterBar>
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="future">Future</option>
          <option value="expired">Expired</option>
        </select>
      </FilterBar>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "name",
            header: "Campaign",
            render: (row) => <span className="font-semibold">{row.name}</span>,
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
              row.discountType === "percentage" ? `${row.value}%` : `${row.value.toLocaleString("nb-NO")} NOK`,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />

      {openModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-bold text-[#003a4d]">Create Discount</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                placeholder="Campaign name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value as "percentage" | "fixed")}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={scopeType}
                onChange={(event) => {
                  const nextScope = event.target.value as "product" | "category";
                  setScopeType(nextScope);
                  setScopeId((nextScope === "product" ? products[0]?.id : categories[0]?.id) ?? "");
                }}
              >
                <option value="product">Product scope</option>
                <option value="category">Category scope</option>
              </select>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={scopeId}
                onChange={(event) => setScopeId(event.target.value)}
              >
                {scopeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="number"
                min={0}
                placeholder="Discount value"
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={() => setOpenModal(false)}>
                Cancel
              </button>
              <button
                className="rounded-lg bg-[#00526C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => createMutation.mutate()}
                disabled={!name || !customerId || !scopeId || createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
