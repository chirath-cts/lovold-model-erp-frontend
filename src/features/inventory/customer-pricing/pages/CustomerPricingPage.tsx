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
        variant="ops"
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total agreements"
          value={String(agreements.length)}
          supporting="Current product-level pricing agreements."
          variant="ops"
        />
        <SummaryCard
          label="Active agreements"
          value={String(agreements.filter((agreement) => agreement.status === "active").length)}
          supporting="Currently valid for order pricing."
          variant="ops"
        />
        <SummaryCard
          label="Future agreements"
          value={String(agreements.filter((agreement) => agreement.status === "future").length)}
          supporting="Signed, but not yet active."
          variant="ops"
        />
        <SummaryCard
          label="Component pricing rule"
          value="Derived"
          tone="brand"
          supporting="Components inherit pricing visibility from base products."
          variant="ops"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.85fr)]">
        <div className="space-y-4">
          <section className="app-ops-toolbar space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-800">
                  Agreement filters
                </h2>
                <p className="text-sm text-slate-500">
                  Filter base-product pricing agreements by customer or validity status.
                </p>
              </div>
              <div className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                Active filters: {[customerId, statusFilter].filter(Boolean).length}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="app-label">Customer</span>
              <div className="app-ops-control">
                <select className="app-select-sharp bg-transparent px-0 py-0 shadow-none ring-0 focus:ring-0" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                  <option value="">All customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="space-y-2">
              <span className="app-label">Status</span>
              <div className="app-ops-control">
                <select className="app-select-sharp bg-transparent px-0 py-0 shadow-none ring-0 focus:ring-0" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="future">Future</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </label>
            </div>
          </section>

          {agreements.length === 0 ? (
            <EmptyPanel
              title="No agreements match these filters"
              copy="Create a product-specific agreement to support negotiated Lovold customer pricing."
              variant="ops"
            />
          ) : (
            <section className="app-registry-table-block">
              <div className="app-registry-table-header">
                <div className="space-y-1">
                  <h2 className="app-registry-table-header-title">Pricing agreements</h2>
                  <p className="app-registry-table-header-copy">
                    Product-only customer agreements. Component pricing remains derived from the underlying base products.
                  </p>
                </div>
              </div>
              <div className="app-registry-table-scroll">
                <table className="app-registry-table app-registry-table-compact">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th className="text-right">Discount</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th className="w-[60px] text-right" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {agreements.map((agreement) => (
                    <tr key={agreement.id} className="app-registry-table-row">
                      <td>{customerLookup.get(agreement.customerId)?.name ?? agreement.customerId}</td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-800">
                            {productLookup.get(agreement.productId)?.name ?? agreement.productId}
                          </div>
                          <div className="text-xs text-slate-500">
                            {productLookup.get(agreement.productId)?.sku}
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-xs font-mono font-semibold text-slate-800">
                        {agreement.discountPercent}%
                      </td>
                      <td>
                        <div className="text-sm text-slate-500">
                          {agreement.startDate ? agreement.startDate.slice(0, 10) : "Open"} -{" "}
                          {agreement.endDate ? agreement.endDate.slice(0, 10) : "Open"}
                        </div>
                      </td>
                      <td>
                        <StatusBadge value={agreement.status} />
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="inline-flex rounded-sm border border-slate-200 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                          disabled
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              <div className="app-registry-table-footer">
                <span className="app-registry-table-footer-label">
                  Showing 1-{agreements.length} of {agreements.length} agreements
                </span>
                <div className="app-registry-table-pagination">
                  <button className="app-registry-table-pagination-button" disabled>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="app-registry-table-pagination-current">1</span>
                  </div>
                  <button className="app-registry-table-pagination-button">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        <DataPanel title="Create agreement" description="Customer pricing remains product-only in the finalized Lovold spec." variant="ops">
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="app-label">Customer</span>
              <select className="app-select-sharp" value={draft.customerId} onChange={(event) => setDraft((current) => ({ ...current, customerId: event.target.value }))}>
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
              <select className="app-select-sharp" value={draft.productId} onChange={(event) => setDraft((current) => ({ ...current, productId: event.target.value }))}>
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
              <input className="app-input-sharp" type="number" min="0" value={draft.discountPercent} onChange={(event) => setDraft((current) => ({ ...current, discountPercent: event.target.value }))} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="app-label">Start date</span>
                <input className="app-input-sharp" type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
              </label>
              <label className="space-y-2">
                <span className="app-label">End date</span>
                <input className="app-input-sharp" type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-500">
              <input
                checked={draft.isActive}
                onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                type="checkbox"
              />
              Agreement active
            </label>
            <button
              type="button"
              className="app-button-primary-sharp w-full disabled:cursor-not-allowed disabled:opacity-50"
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
