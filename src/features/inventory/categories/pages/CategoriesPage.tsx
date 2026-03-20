import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import WaterRoundedIcon from "@mui/icons-material/WaterRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import { queryClient } from "@/app/queryClient";
import { categoriesService } from "@/services/endpoints/categoriesService";
import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";

const palette = {
  background: "#f4faff",
  surface: "#ffffff",
  surfaceLow: "#e8f6fe",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#d7e5ed",
  primary: "#003a4d",
  primaryContainer: "#00526c",
  primaryFixed: "#bfe8ff",
  secondary: "#1f6581",
  secondaryContainer: "#9eddfd",
  tertiary: "#183947",
  outline: "rgba(192, 200, 205, 0.35)",
  muted: "#70787d",
};

const tableHeadSx = {
  px: 3,
  py: 2.5,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 1.2,
  color: "text.secondary",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(192, 200, 205, 0.18)",
  backgroundColor: "rgba(232, 246, 254, 0.6)",
};

const tableCellSx = {
  px: 3,
  py: 2.75,
  borderBottom: "1px solid rgba(192, 200, 205, 0.08)",
};

const gradientButtonSx = {
  px: 3.5,
  py: 1.75,
  borderRadius: 2,
  fontWeight: 800,
  textTransform: "none",
  gap: 1,
  color: "#fff",
  background: "linear-gradient(135deg, #003a4d 0%, #00526c 100%)",
  boxShadow: "0px 20px 38px rgba(0, 82, 108, 0.18)",
  "&:hover": {
    background: "linear-gradient(135deg, #00445a 0%, #006181 100%)",
    transform: "scale(1.01)",
  },
  "&:active": { transform: "scale(0.99)" },
};

const pillSx = (tone: "active" | "pending") => ({
  px: 1.5,
  py: 0.75,
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.2,
  textTransform: "uppercase",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  bgcolor: tone === "active" ? palette.secondaryContainer : palette.surfaceLow,
  color: tone === "active" ? palette.secondary : palette.muted,
});

const iconSwatches = [
  RestaurantRoundedIcon,
  WaterRoundedIcon,
  ScienceRoundedIcon,
  Inventory2RoundedIcon,
];

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const categoriesQuery = useCategories();
  const productsQuery = useProducts();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      categoriesService.create({
        id: `cat-${crypto.randomUUID().slice(0, 8)}`,
        name,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      setOpenModal(false);
      setName("");
      setDescription("");
    },
  });

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return <LoadingState label="Loading categories..." />;
  }

  if (categoriesQuery.error || productsQuery.error) {
    return <ErrorState message="Failed to load categories." />;
  }

  const rows = categories
    .filter((category) =>
      [category.name, category.description]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .map((category) => ({
      ...category,
      productCount: products.filter(
        (product) => product.categoryId === category.id,
      ).length,
    }));

  const totalCategories = rows.length;
  const totalProducts = products.length;
  const describedCategories = rows.filter((row) =>
    row.description?.trim(),
  ).length;
  const healthPct = totalCategories
    ? Math.round((describedCategories / totalCategories) * 1000) / 10
    : 0;
  const maxProducts =
    rows.reduce((max, row) => Math.max(max, row.productCount), 0) || 1;
  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <>
      <Box
        sx={{ backgroundColor: palette.background, minHeight: "100%", py: 5 }}
      >
        <Stack spacing={5} sx={{ mx: "auto", px: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="flex-end"
            justifyContent="space-between"
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: palette.muted,
                  }}
                >
                  Inventory
                </Typography>
                <ChevronRightRoundedIcon
                  fontSize="small"
                  sx={{ color: palette.muted }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: palette.primary,
                  }}
                >
                  Categories
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  color: palette.primary,
                  letterSpacing: -0.5,
                }}
              >
                Categories
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 1, maxWidth: 560 }}
              >
                Manage aquaculture stock classifications, monitor biodiversity
                metrics, and organize your operational resource pools.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              startIcon={<AddCircleRoundedIcon />}
              sx={gradientButtonSx}
            >
              Add Category
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <Box
              sx={{
                gridColumn: { xs: "span 1", md: "span 2" },
                p: 3,
                borderRadius: 3,
                backgroundColor: palette.surfaceLow,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: palette.primary,
                  textTransform: "uppercase",
                }}
              >
                Total Classifications
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-end"
                sx={{ mt: 3 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: palette.primary,
                    letterSpacing: -1,
                  }}
                >
                  {totalCategories}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1, color: palette.secondary, fontWeight: 700 }}
                >
                  <TrendingUpRoundedIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    +12% this quarter
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: palette.primary,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  opacity: 0.8,
                  textTransform: "uppercase",
                }}
              >
                Active Stocks
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {totalProducts}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Live specimens tracked
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: palette.secondaryContainer,
                color: palette.primary,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  opacity: 0.8,
                  textTransform: "uppercase",
                }}
              >
                System Health
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {healthPct.toFixed(1)}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Metadata completeness
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: palette.surface,
              borderRadius: 3,
              boxShadow: "0px 10px 30px rgba(0,58,77,0.06)",
              overflow: "hidden",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{ p: 3, borderBottom: "1px solid rgba(232, 246, 254, 1)" }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: palette.primary }}
              >
                Category Management
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="text"
                  startIcon={<FilterListRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "none",
                    px: 2,
                  }}
                >
                  Filter
                </Button>
                <Button
                  variant="text"
                  startIcon={<DownloadRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "none",
                    px: 2,
                  }}
                >
                  Export
                </Button>
                <Box sx={{ width: 220, display: { xs: "none", md: "block" } }}>
                  <SearchInput
                    placeholder="Search categories..."
                    value={search}
                    onChange={setSearch}
                  />
                </Box>
              </Stack>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>Category Name</TableCell>
                    <TableCell sx={tableHeadSx}>Description</TableCell>
                    <TableCell sx={tableHeadSx}>Product Count</TableCell>
                    <TableCell sx={tableHeadSx}>Status</TableCell>
                    <TableCell sx={{ ...tableHeadSx, textAlign: "right" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row, idx) => {
                    const Icon = iconSwatches[idx % iconSwatches.length];
                    const statusTone =
                      row.productCount > 0 ? "active" : "pending";
                    const barWidth = Math.min(
                      100,
                      Math.round((row.productCount / maxProducts) * 100),
                    );
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(231, 242, 249, 0.8)",
                          },
                        }}
                      >
                        <TableCell sx={tableCellSx}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "rgba(31, 101, 129, 0.12)",
                                color: palette.secondary,
                                fontWeight: 700,
                              }}
                            >
                              <Icon fontSize="small" />
                            </Avatar>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 700, color: palette.primary }}
                            >
                              {row.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{ ...tableCellSx, color: "text.secondary" }}
                        >
                          <Typography variant="body2" noWrap>
                            {row.description}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellSx}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: palette.primary }}
                            >
                              {row.productCount}
                            </Typography>
                            <Box sx={{ width: 64 }}>
                              <LinearProgress
                                variant="determinate"
                                value={barWidth}
                                sx={{
                                  height: 6,
                                  borderRadius: 999,
                                  backgroundColor: "rgba(31, 101, 129, 0.12)",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: palette.secondary,
                                  },
                                }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={tableCellSx}>
                          <Chip
                            label={
                              statusTone === "active" ? "Active" : "Pending"
                            }
                            size="small"
                            sx={pillSx(statusTone)}
                            avatar={
                              <Box
                                component="span"
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor:
                                    statusTone === "active"
                                      ? palette.secondary
                                      : palette.outline,
                                }}
                              />
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>
                          <IconButton>
                            <MoreVertRoundedIcon
                              sx={{ color: palette.muted }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              rowsPerPageOptions={[rowsPerPage]}
              rowsPerPage={rowsPerPage}
              count={rows.length}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                // rowsPerPage is fixed to 5 per design; keep handler to satisfy MUI signature.
                event.preventDefault();
                setPage(0);
              }}
              labelRowsPerPage=""
              sx={{
                px: 2,
                backgroundColor: "rgba(232,246,254,0.4)",
                borderTop: "1px solid rgba(232,246,254,1)",
                ".MuiTablePagination-toolbar": {
                  justifyContent: "space-between",
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              gap: 3,
            }}
          >
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: palette.surfaceLow,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: palette.primary, mb: 1 }}
              >
                Inventory Distribution
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", maxWidth: 420, mb: 3 }}
              >
                A visual breakdown of current livestock versus operational
                equipment by category weight.
              </Typography>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-end"
                sx={{ height: 160 }}
              >
                {[60, 90, 40, 75, 55].map((height, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: "100%",
                      height: `${height}%`,
                      backgroundColor: "rgba(0,58,77,0.18)",
                      borderRadius: 1.5,
                      transition: "background-color 0.2s ease",
                      "&:hover": { backgroundColor: "rgba(0,58,77,0.32)" },
                    }}
                  />
                ))}
              </Stack>
              <Box
                sx={{
                  position: "absolute",
                  right: -64,
                  bottom: -64,
                  width: 220,
                  height: 220,
                  backgroundColor: "rgba(0,58,77,0.06)",
                  borderRadius: "50%",
                  filter: "blur(28px)",
                }}
              />
            </Box>

            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: palette.tertiary,
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Inventory2RoundedIcon
                sx={{ fontSize: 40, opacity: 0.35, mb: 2 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Category Health Checklist
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {[
                  { label: "SKU Mapping Complete", done: true },
                  { label: "Tax Codes Assigned", done: true },
                  { label: "Vendor Linking (3 Left)", done: false },
                ].map((item) => (
                  <Stack
                    key={item.label}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ opacity: item.done ? 0.9 : 0.6 }}
                  >
                    {item.done ? (
                      <CheckCircleRoundedIcon
                        fontSize="small"
                        sx={{ color: palette.primaryFixed }}
                      />
                    ) : (
                      <RadioButtonUncheckedRoundedIcon
                        fontSize="small"
                        sx={{ color: palette.primaryFixed }}
                      />
                    )}
                    <Typography variant="body2">{item.label}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.12,
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Category name"
              size="small"
              value={name}
              onChange={(event) => setName(event.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              size="small"
              multiline
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!name || !description || createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
