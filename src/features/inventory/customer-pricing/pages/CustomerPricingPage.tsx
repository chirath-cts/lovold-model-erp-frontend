import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/queryClient";
import { customerProductsService } from "@/services/endpoints/customerProductsService";
import {
  useCustomerProducts,
  useCustomers,
  useProducts,
} from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  DataPanel,
  EmptyPanel,
  InventoryPageHeader,
  SummaryCard,
} from "@/features/inventory/shared/InventoryScaffold";

const createAgreementId = () =>
  `cpa-${Math.random().toString(36).slice(2, 10)}`;

export function CustomerPricingPage() {
  const [customerId, setCustomerId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [draft, setDraft] = useState({
    customerId: "",
    productId: "",
    discountPercent: "0",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const agreementsQuery = useCustomerProducts({
    customerId: customerId || undefined,
    status: (statusFilter || undefined) as "active" | "future" | "expired" | undefined,
  });
  const customersQuery = useCustomers();
  const productsQuery = useProducts();

  const createMutation = useMutation({
    mutationFn: async () =>
      customerProductsService.create({
        id: createAgreementId(),
        customerId: draft.customerId,
        productId: draft.productId,
        discountPercent: Number(draft.discountPercent),
        startDate: draft.startDate || null,
        endDate: draft.endDate || null,
        isActive: draft.isActive,
      }),
    onSuccess: async () => {
      setDraft({
        customerId: "",
        productId: "",
        discountPercent: "0",
        startDate: "",
        endDate: "",
        isActive: true,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.customerProducts });
    },
  });

  if (
    agreementsQuery.isLoading ||
    customersQuery.isLoading ||
    productsQuery.isLoading
  ) {
    return <LoadingState label="Loading customer pricing agreements..." />;
  }

  if (agreementsQuery.isError || customersQuery.isError || productsQuery.isError) {
    return <ErrorState title="Could not load customer pricing agreements." />;
  }

  const agreements = agreementsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const customerLookup = new Map(customers.map((customer) => [customer.id, customer]));
  const productLookup = new Map(products.map((product) => [product.id, product]));

  return (
    <div className="app-page">
      <InventoryPageHeader
        eyebrow="Inventory / Customer Pricing"
        title="Customer Pricing Agreements"
        description="Lovold pricing agreements apply only to base products. Component pricing stays derived from their underlying products plus standard production cost."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total agreements"
          value={String(agreements.length)}
          supporting="Current product-level pricing agreements."
        />
        <SummaryCard
          label="Active agreements"
          value={String(agreements.filter((agreement) => agreement.status === "active").length)}
          supporting="Currently valid for order pricing."
        />
        <SummaryCard
          label="Future agreements"
          value={String(agreements.filter((agreement) => agreement.status === "future").length)}
          supporting="Signed, but not yet active."
        />
        <SummaryCard
          label="Component pricing rule"
          value="Derived"
          tone="brand"
          supporting="Components inherit pricing visibility from base products."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.85fr)]">
        <DataPanel title="Agreements" description="Filter product pricing agreements by customer or validity status.">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="app-label">Customer</span>
              <select className="app-select" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">All customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="app-label">Status</span>
              <select className="app-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="future">Future</option>
                <option value="expired">Expired</option>
              </select>
            </label>
          </div>

          {agreements.length === 0 ? (
            <EmptyPanel
              title="No agreements match these filters"
              copy="Create a product-specific agreement to support negotiated Lovold customer pricing."
            />
          ) : (
            <div className="app-table-shell">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Discount</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {agreements.map((agreement) => (
                    <tr key={agreement.id}>
                      <td>{customerLookup.get(agreement.customerId)?.name ?? agreement.customerId}</td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-[var(--text-primary)]">
                            {productLookup.get(agreement.productId)?.name ?? agreement.productId}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {productLookup.get(agreement.productId)?.sku}
                          </div>
                        </div>
                      </td>
                      <td>{agreement.discountPercent}%</td>
                      <td>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {agreement.startDate ? agreement.startDate.slice(0, 10) : "Open"} -{" "}
                          {agreement.endDate ? agreement.endDate.slice(0, 10) : "Open"}
                        </div>
                      </td>
                      <td>
                        <StatusBadge value={agreement.status} />
                      </td>
                      <td className="text-right">
                        <button type="button" className="app-button-ghost" disabled>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataPanel>

        <DataPanel title="Create agreement" description="Customer pricing remains product-only in the finalized Lovold spec.">
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="app-label">Customer</span>
              <select className="app-select" value={draft.customerId} onChange={(event) => setDraft((current) => ({ ...current, customerId: event.target.value }))}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="app-label">Base product</span>
              <select className="app-select" value={draft.productId} onChange={(event) => setDraft((current) => ({ ...current, productId: event.target.value }))}>
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="app-label">Discount percent</span>
              <input className="app-input" type="number" min="0" value={draft.discountPercent} onChange={(event) => setDraft((current) => ({ ...current, discountPercent: event.target.value }))} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="app-label">Start date</span>
                <input className="app-input" type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="app-label">End date</span>
                <input className="app-input" type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <input
                checked={draft.isActive}
                onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                type="checkbox"
              />
              Agreement active
            </label>
            <button
              type="button"
              className="app-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                !draft.customerId ||
                !draft.productId ||
                createMutation.isPending
              }
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Saving..." : "Create agreement"}
            </button>
          </div>
        </DataPanel>
      </div>
    </div>
  );
}
