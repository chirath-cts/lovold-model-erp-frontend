import type { ReactNode } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

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

const resolveAlign = (align?: "left" | "right" | "center") => align ?? "left";

export function DataTable<TItem>({ rows, columns, rowKey }: DataTableProps<TItem>) {
  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={resolveAlign(column.align)}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              hover
              sx={{
                "&:last-child td, &:last-child th": { borderBottom: 0 },
              }}
            >
              {columns.map((column) => (
                <TableCell key={column.key} align={resolveAlign(column.align)}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
