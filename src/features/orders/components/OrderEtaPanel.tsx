import { formatDate } from "@/shared/lib/format";
import type { OrderEtaPreview } from "@/features/orders/model/orderHelpers";

function EtaCard({
  label,
  value,
  tone = "default",
  supporting,
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "brand";
  supporting?: string;
}) {
  return (
    <div
      className={[
        "rounded-sm border px-4 py-4 shadow-[0_4px_24px_-8px_rgba(25,28,30,0.08)]",
        tone === "default" && "border-slate-200 bg-slate-50",
        tone === "brand" && "border-blue-300 bg-blue-50 text-blue-900",
        tone === "warning" && "border-amber-200 bg-amber-50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={tone === "brand" ? "text-xs font-bold uppercase tracking-[0.14em] text-blue-700" : tone === "warning" ? "text-xs font-bold uppercase tracking-[0.14em] text-amber-700" : "text-xs font-bold uppercase tracking-[0.14em] text-slate-600"}>
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold tracking-tight">
        {value}
      </div>
      {supporting ? (
        <div className={tone === "brand" ? "mt-2 text-xs text-blue-700/80" : tone === "warning" ? "mt-2 text-xs text-amber-700/80" : "mt-2 text-xs text-slate-600"}>
          {supporting}
        </div>
      ) : null}
    </div>
  );
}

const formatEta = (value: string | null) => (value ? formatDate(value) : "Pending");

export function OrderEtaPanel({
  eta,
  qualityCheckLeadDays,
  packagingLeadDays,
}: {
  eta: OrderEtaPreview;
  qualityCheckLeadDays?: number;
  packagingLeadDays?: number;
}) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-[0_4px_24px_-6px_rgba(25,28,30,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            ETA planning
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">
            ETA Planning
          </h2>
          <p className="text-sm text-slate-600">
            Promised ETA is derived from material availability, production, QC, packaging, and delivery.
          </p>
        </div>
        {eta.blocked ? (
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-rose-800">
            Material blocked
          </span>
        ) : eta.waitingOnInbound ? (
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-900">
            Waiting on inbound
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
            Materials available
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EtaCard
          label="Materials"
          value={formatEta(eta.materialAvailabilityEta)}
          tone={eta.waitingOnInbound || eta.blocked ? "warning" : "default"}
          supporting={eta.waitingOnInbound ? "Earliest full quantity from inbound supply" : "Current inventory or ready-made stock coverage"}
        />
        <EtaCard
          label="Production Complete"
          value={formatEta(eta.productionCompletionEta)}
          supporting="Calculated from order-level production steps"
        />
        <EtaCard
          label="Delivery ETA"
          value={formatEta(eta.deliveryEta)}
          supporting="Includes manual delivery lead time on the order"
        />
        <EtaCard
          label="Promised ETA"
          value={formatEta(eta.promisedEta)}
          tone="brand"
          supporting="Stored customer-facing commitment"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Fixed business lead items
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Quality check
              </div>
              <div className="text-sm text-slate-600">
                {qualityCheckLeadDays ?? 0} day(s)
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Packaging
              </div>
              <div className="text-sm text-slate-600">
                {packagingLeadDays ?? 0} day(s)
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Planning notes
          </div>
          {eta.blockers.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {eta.blockers.map((blocker) => (
                <li key={blocker} className="rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
                  {blocker}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>ETA preview is based on the current line items, production steps, and business lead settings.</p>
              <p>
                Components consume ready-made stock first, then fall back to underlying products and inbound availability for the remaining quantity.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
