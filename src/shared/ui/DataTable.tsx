import type { ReactNode } from "react";

interface Column<TItem> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (item: TItem) => ReactNode;
}

interface DataTableProps<TItem> {
  rows: TItem[];
  columns: Column<TItem>[];
  rowKey: (item: TItem) => string;
}

export function DataTable<TItem>({ rows, columns, rowKey }: DataTableProps<TItem>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-slate-700 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
