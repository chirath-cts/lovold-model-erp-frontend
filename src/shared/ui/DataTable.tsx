import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

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
  pageSize?: number;
  entityLabel?: string;
  disablePagination?: boolean;
}

const resolveAlign = (align?: "left" | "right" | "center") => align ?? "left";

const TableCard = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 16px 40px rgba(0, 58, 77, 0.08)",
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2.5, 3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
  padding: theme.spacing(2.5, 3),
  fontSize: "0.95rem",
}));

const HoverRow = styled(TableRow)(({ theme }) => ({
  "&:last-of-type td": { borderBottom: "none" },
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
  transition: "background-color 120ms ease",
}));

const PaginationBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2.5, 3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.6),
}));

export function DataTable<TItem>({
  rows,
  columns,
  rowKey,
  pageSize = 5,
  entityLabel = "records",
  disablePagination = false,
}: DataTableProps<TItem>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    if (disablePagination) return rows;
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize, disablePagination]);

  const startItem = rows.length === 0 ? 0 : disablePagination ? 1 : (page - 1) * pageSize + 1;
  const endItem = disablePagination ? rows.length : Math.min(page * pageSize, rows.length);

  const visiblePages = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page === 1) return [1, 2, 3];
    if (page === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  return (
    <TableCard>
      <TableContainer>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableHeadCell key={column.key} align={resolveAlign(column.align)}>
                {column.header}
              </StyledTableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((row) => (
            <HoverRow
              key={rowKey(row)}
            >
              {columns.map((column) => (
                <StyledTableCell key={column.key} align={resolveAlign(column.align)}>
                  {column.render(row)}
                </StyledTableCell>
              ))}
            </HoverRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      {!disablePagination && (
        <PaginationBar>
          <Typography variant="body2" color="text.secondary">
            Showing{" "}
            <Typography component="span" fontWeight={700} color="primary">
              {rows.length === 0 ? 0 : startItem}
            </Typography>{" "}
            -{" "}
            <Typography component="span" fontWeight={700} color="primary">
              {endItem}
            </Typography>{" "}
            of{" "}
            <Typography component="span" fontWeight={700} color="primary">
              {rows.length}
            </Typography>{" "}
            {entityLabel}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              color="primary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>

            {visiblePages.map((pageNumber) => (
              <Button
                key={pageNumber}
                size="small"
                variant={pageNumber === page ? "contained" : "outlined"}
                color="primary"
                onClick={() => setPage(pageNumber)}
                sx={{ minWidth: 40, borderRadius: 2, fontWeight: 700 }}
              >
                {pageNumber}
              </Button>
            ))}

            <IconButton
              size="small"
              color="primary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </PaginationBar>
      )}
    </TableCard>
  );
}
