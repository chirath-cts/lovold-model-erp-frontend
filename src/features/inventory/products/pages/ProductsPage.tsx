import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Controller,
  useForm,
  type Path,
  type UseFormReturn,
} from "react-hook-form";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";

import { queryClient } from "@/app/queryClient";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "@/features/inventory/products/model/createProductSchema";
import {
  updateProductSchema,
  type UpdateProductFormValues,
} from "@/features/inventory/products/model/updateProductSchema";
import {
  productsService,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/services/endpoints/productsService";
import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { normalizeError } from "@/services/http/errors";
import { queryKeys } from "@/shared/constants/queryKeys";
import type { Product } from "@/shared/types/domain";
import { CurrencyText } from "@/shared/ui/CurrencyText";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";

const palette = {
  background: "#f4faff",
  surface: "#ffffff",
  surfaceLow: "#e8f6fe",
  surfaceLowest: "#ffffff",
  primary: "#003a4d",
  primaryContainer: "#00526c",
  primaryFixed: "#bfe8ff",
  secondary: "#1f6581",
  secondaryContainer: "#9eddfd",
  error: "#ba1a1a",
  muted: "#70787d",
};

const createFormDefaults: CreateProductFormValues = {
  name: "",
  sku: "",
  categoryId: "",
  basePrice: 0,
  purchasePrice: 0,
  stockQuantity: 0,
  reorderLevel: 0,
  unit: "pcs",
  status: "active",
  description: "",
  imageUrl: null,
};

const updateFormDefaults: UpdateProductFormValues = {
  name: "",
  sku: "",
  categoryId: "",
  basePrice: 0,
  purchasePrice: 0,
  stockQuantity: 0,
  reorderLevel: 0,
  unit: "pcs",
  status: "active",
  description: "",
  imageUrl: null,
};

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

type ProductFormWithImage = CreateProductFormValues | UpdateProductFormValues;

const stockChipTone = (health: "healthy" | "low" | "critical") => {
  if (health === "healthy")
    return { bg: palette.secondaryContainer, color: palette.primary };
  if (health === "low") return { bg: "rgba(0,0,0,0.06)", color: palette.muted };
  return { bg: "rgba(186, 26, 26, 0.14)", color: palette.error };
};

function ProductImageUpload<TFormValues extends ProductFormWithImage>({
  form,
  inputId,
  placeholder,
}: {
  form: UseFormReturn<TFormValues>;
  inputId: string;
  placeholder?: string;
}) {
  const imageFieldName = "imageUrl" as Path<TFormValues>;
  const imageUrl =
    (form.watch(imageFieldName) as string | null | undefined) ?? null;
  const imageErrorMessage = form.formState.errors.imageUrl?.message as
    | string
    | undefined;
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      form.setError(imageFieldName, {
        type: "validate",
        message: "Only image files are allowed",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      form.setError(imageFieldName, {
        type: "validate",
        message: "Image must be 1MB or smaller",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        form.setValue(imageFieldName, reader.result as never, {
          shouldDirty: true,
        });
        form.clearErrors(imageFieldName);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    form.setValue(imageFieldName, null as never, { shouldDirty: true });
    form.clearErrors(imageFieldName);
    setFileName(null);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Product Image</Typography>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button component="label" variant="outlined" size="small">
          Choose image
          <input
            hidden
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        {imageUrl ? (
          <Button size="small" color="secondary" onClick={handleRemove}>
            Remove
          </Button>
        ) : null}
        {fileName && imageUrl ? (
          <Typography variant="body2" color="text.secondary">
            {fileName}
          </Typography>
        ) : null}
      </Stack>

      {imageUrl ? (
        <Box
          sx={{
            mt: 1,
            width: "100%",
            maxWidth: 240,
            borderRadius: 1,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            backgroundColor: "grey.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt={fileName ?? "Product image"}
            sx={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain" }}
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {placeholder ??
            "Upload JPG, PNG, or WebP up to 1MB. Keeps existing image if none selected."}
        </Typography>
      )}

      {imageErrorMessage ? (
        <Typography variant="caption" color="error">
          {imageErrorMessage}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockFilter, setStockFilter] = useState<
    "" | "healthy" | "low" | "critical"
  >("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const categoriesQuery = useCategories();
  const productsQuery = useProducts();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const createForm = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: createFormDefaults,
  });

  const updateForm = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: updateFormDefaults,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateProductFormValues) => {
      const payload: CreateProductPayload = {
        id: crypto.randomUUID(),
        name: values.name.trim(),
        sku: values.sku.trim(),
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        purchasePrice: values.purchasePrice,
        stockQuantity: values.stockQuantity,
        reorderLevel: values.reorderLevel,
        unit: values.unit.trim(),
        status: values.status,
        description: values.description?.trim() ?? "",
        imageUrl: values.imageUrl ?? null,
      };

      return productsService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      setOpenCreateDialog(false);
      createForm.reset({
        ...createFormDefaults,
        categoryId: categories[0]?.id ?? "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateProductFormValues) => {
      if (!editingProduct) {
        throw new Error("No product selected for editing.");
      }

      const payload: UpdateProductPayload = {
        name: values.name.trim(),
        sku: values.sku.trim(),
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        purchasePrice: values.purchasePrice,
        stockQuantity: values.stockQuantity,
        reorderLevel: values.reorderLevel,
        unit: values.unit.trim(),
        status: values.status,
        description: values.description?.trim() ?? "",
        imageUrl: values.imageUrl ?? editingProduct.imageUrl ?? null,
      };

      return productsService.update(editingProduct.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      setEditingProduct(null);
    },
  });

  const handleOpenCreateDialog = () => {
    createForm.reset({
      ...createFormDefaults,
      categoryId: categories[0]?.id ?? "",
    });
    setOpenCreateDialog(true);
  };

  const handleOpenEditDrawer = (product: Product) => {
    updateMutation.reset();
    updateForm.reset({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      purchasePrice: product.purchasePrice,
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      unit: product.unit,
      status: product.status,
      description: product.description,
      imageUrl: product.imageUrl ?? null,
    });
    setEditingProduct(product);
  };

  const handleCloseEditDrawer = () => {
    setEditingProduct(null);
    updateMutation.reset();
  };

  const categoryLookup = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  const rows = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          stockHealth:
            product.stockQuantity <= product.reorderLevel
              ? "critical"
              : product.stockQuantity <= product.reorderLevel * 1.4
                ? "low"
                : "healthy",
        }))
        .filter((product) =>
          categoryId ? product.categoryId === categoryId : true,
        )
        .filter((product) =>
          stockFilter ? product.stockHealth === stockFilter : true,
        )
        .filter((product) =>
          [product.name, product.sku]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
    [products, categoryId, stockFilter, search],
  );

  const totalAssets = products.length;
  const lowInventoryCount = products.filter(
    (product) => product.stockQuantity <= product.reorderLevel * 1.4,
  ).length;
  const inventoryValuation = products.reduce(
    (sum, product) => sum + product.basePrice * product.stockQuantity,
    0,
  );

  useEffect(() => {
    setPage(0);
  }, [search, categoryId, stockFilter, rows.length]);

  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return <LoadingState label="Loading products..." />;
  }

  if (categoriesQuery.error || productsQuery.error) {
    return <ErrorState message="Failed to load products." />;
  }

  return (
    <>
      <Box
        sx={{ backgroundColor: palette.background, minHeight: "100%", py: 4 }}
      >
        <Stack
          spacing={4}
          sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}
        >
          {/* Filters & Actions */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  displayEmpty
                  IconComponent={ExpandMoreRoundedIcon}
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    backgroundColor: palette.surfaceLowest,
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.04)",
                  }}
                  renderValue={(value) =>
                    value ? categoryLookup.get(value) : "All Categories"
                  }
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={stockFilter}
                  onChange={(event) =>
                    setStockFilter(
                      event.target.value as "" | "healthy" | "low" | "critical",
                    )
                  }
                  displayEmpty
                  IconComponent={ExpandMoreRoundedIcon}
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    backgroundColor: palette.surfaceLowest,
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.04)",
                  }}
                  renderValue={(value) =>
                    value
                      ? `${value.charAt(0).toUpperCase()}${value.slice(1)} Stock`
                      : "Stock Status"
                  }
                >
                  <MenuItem value="">Stock Status</MenuItem>
                  <MenuItem value="healthy">Healthy</MenuItem>
                  <MenuItem value="low">Low Stock</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreateDialog}
              disabled={categories.length === 0}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: 2,
                background: "linear-gradient(135deg, #003a4d 0%, #00526c 100%)",
                boxShadow: "0 12px 24px rgba(0,82,108,0.18)",
              }}
            >
              Add Product
            </Button>
          </Stack>

          {/* Search */}
          <Box sx={{ maxWidth: 400 }}>
            <SearchInput
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={setSearch}
            />
          </Box>

          {/* Stats grid */}
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
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                boxShadow: "0px 6px 16px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${palette.primary}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "text.secondary",
                }}
              >
                Total Assets
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: palette.primary, mt: 0.5 }}
              >
                {totalAssets.toLocaleString()}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 2, color: palette.secondary }}
              >
                <TrendingUpRoundedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  +12% from last month
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                boxShadow: "0px 6px 16px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${palette.error}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "text.secondary",
                }}
              >
                Low Inventory
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: palette.error, mt: 0.5 }}
              >
                {lowInventoryCount}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 2, color: palette.error }}
              >
                <PriorityHighRoundedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Action required immediately
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                boxShadow: "0px 10px 28px rgba(0,82,108,0.18)",
                background: palette.primary,
                color: "#fff",
                gridColumn: { xs: "span 1", md: "span 2" },
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, letterSpacing: 1, opacity: 0.75 }}
              >
                Inventory Valuation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                <CurrencyText value={inventoryValuation} />
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: 12,
                    bgcolor: "rgba(255,255,255,0.16)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.28)",
                  }}
                >
                  A
                </Avatar>
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: 12,
                    bgcolor: "rgba(255,255,255,0.16)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.28)",
                    ml: -1.5,
                  }}
                >
                  B
                </Avatar>
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: 12,
                    bgcolor: "rgba(255,255,255,0.16)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.28)",
                    ml: -1.5,
                  }}
                >
                  C
                </Avatar>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Supplied by 12 Global Vendors
                </Typography>
              </Stack>
              <Inventory2RoundedIcon
                sx={{
                  position: "absolute",
                  right: -20,
                  bottom: -10,
                  fontSize: 140,
                  opacity: 0.1,
                }}
              />
            </Paper>
          </Box>

          {/* Table */}
          {rows.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try another search or filter."
            />
          ) : (
            <Paper
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0px 6px 16px rgba(0,0,0,0.05)",
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(232,240,245,0.6)" }}>
                      {[
                        { label: "Product Code", align: "left" },
                        { label: "Product Name", align: "left" },
                        { label: "Category", align: "left" },
                        { label: "Selling Price", align: "right" },
                        { label: "Cost Price", align: "right" },
                        { label: "Stock", align: "center" },
                        { label: "Status", align: "center" },
                        { label: "Actions", align: "right" },
                      ].map((col) => (
                        <TableCell
                          key={col.label}
                          align={col.align as any}
                          sx={{
                            px: 2.5,
                            py: 2,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            color: "text.secondary",
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row, idx) => {
                      const tone = stockChipTone(row.stockHealth);
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => setSelectedProduct(row)}
                          sx={{
                            cursor: "pointer",
                            backgroundColor:
                              idx === 0 ? "rgba(215,229,237,0.4)" : "inherit",
                            "&:hover": {
                              backgroundColor: "rgba(215,229,237,0.6)",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              px: 2.5,
                              py: 2,
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: palette.primary,
                            }}
                          >
                            {row.sku}
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Avatar
                                variant="rounded"
                                src={row.imageUrl ?? undefined}
                                alt={row.name}
                                sx={{
                                  width: 42,
                                  height: 42,
                                  bgcolor: "rgba(0,0,0,0.04)",
                                  borderRadius: 1.5,
                                }}
                              >
                                {row.name.slice(0, 2).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {categoryLookup.get(row.categoryId) ?? "—"}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }}>
                            <Typography variant="body2">
                              {categoryLookup.get(row.categoryId) ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }} align="right">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              <CurrencyText value={row.basePrice} />
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }} align="right">
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              <CurrencyText value={row.purchasePrice} />
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }} align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color:
                                  row.stockHealth === "critical"
                                    ? palette.error
                                    : palette.primary,
                              }}
                            >
                              {row.stockQuantity}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }} align="center">
                            <Chip
                              label={
                                row.stockHealth === "critical"
                                  ? "Critical"
                                  : row.stockHealth === "low"
                                    ? "Low Stock"
                                    : "Healthy"
                              }
                              size="small"
                              sx={{
                                px: 1.5,
                                borderRadius: 999,
                                fontSize: 10,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                bgcolor: tone.bg,
                                color: tone.color,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 2.5, py: 2 }} align="right">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(row);
                              }}
                            >
                              <MoreVertRoundedIcon
                                sx={{ color: palette.primary }}
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 3, py: 2, backgroundColor: "rgba(232,246,254,0.4)" }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  Showing{" "}
                  {Math.min(rowsPerPage, rows.length - page * rowsPerPage)} of{" "}
                  {rows.length} products
                </Typography>
                <TablePagination
                  component="div"
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_e, newPage) => setPage(newPage)}
                  rowsPerPageOptions={[rowsPerPage]}
                  labelRowsPerPage=""
                  sx={{
                    ".MuiTablePagination-toolbar": {
                      padding: 0,
                      minHeight: "auto",
                    },
                    ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
                      { display: "none" },
                    ".MuiTablePagination-actions": { ml: 1 },
                  }}
                />
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>

      {/* Product detail drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct ? (
          <Box
            sx={{
              width: { xs: "100vw", sm: 420 },
              bgcolor: palette.surfaceLowest,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(232,246,254,0.5)",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: palette.primary }}
              >
                Product Details
              </Typography>
              <IconButton onClick={() => setSelectedProduct(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
              <Stack spacing={3}>
                {/* Image and header */}
                <Stack spacing={2}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "inset 0 0 0 rgba(0,0,0,0.08)",
                      backgroundColor: palette.surfaceLow,
                      aspectRatio: "16 / 9",
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        selectedProduct.imageUrl ??
                        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80"
                      }
                      alt={selectedProduct.name}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "rgba(255,255,255,0.9)",
                        boxShadow: 2,
                      }}
                    >
                      <ZoomInRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Chip
                      label={selectedProduct.sku}
                      size="small"
                      sx={{
                        bgcolor: "rgba(0,58,77,0.08)",
                        color: palette.primary,
                        fontWeight: 800,
                        fontSize: 10,
                        textTransform: "uppercase",
                      }}
                    />
                    <Chip
                      label={
                        selectedProduct.stockQuantity <=
                        selectedProduct.reorderLevel
                          ? "Critical"
                          : selectedProduct.stockQuantity <=
                              selectedProduct.reorderLevel * 1.4
                            ? "Low Stock"
                            : "In Stock"
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          selectedProduct.stockQuantity <=
                          selectedProduct.reorderLevel
                            ? "rgba(186,26,26,0.16)"
                            : palette.secondaryContainer,
                        color:
                          selectedProduct.stockQuantity <=
                          selectedProduct.reorderLevel
                            ? palette.error
                            : palette.primary,
                        fontWeight: 800,
                        fontSize: 10,
                        textTransform: "uppercase",
                      }}
                    />
                  </Stack>

                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: palette.primary }}
                    >
                      {selectedProduct.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      {selectedProduct.description ||
                        "No description available."}
                    </Typography>
                  </Box>
                </Stack>

                {/* Metrics grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 1.5,
                  }}
                >
                  {[
                    {
                      label: "MSRP",
                      value: <CurrencyText value={selectedProduct.basePrice} />,
                    },
                    {
                      label: "Stock Level",
                      value: `${selectedProduct.stockQuantity} ${selectedProduct.unit}`,
                    },
                    {
                      label: "Reorder Level",
                      value: `${selectedProduct.reorderLevel} ${selectedProduct.unit}`,
                    },
                    {
                      label: "Category",
                      value:
                        categoryLookup.get(selectedProduct.categoryId) ?? "—",
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: palette.surfaceLow,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: 1,
                          color: "text.secondary",
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 800,
                          color: palette.primary,
                          mt: 0.5,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Inventory history placeholder */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 1,
                      color: "text.secondary",
                    }}
                  >
                    Inventory History
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1.5 }}>
                    {[
                      `Restocked: ${selectedProduct.reorderLevel + 10} Units`,
                      "Price Verified",
                      "Initial Entry",
                    ].map((title, i) => (
                      <Stack
                        key={title}
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                        sx={{ position: "relative" }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor:
                              i === 0 ? palette.primary : "rgba(0,0,0,0.08)",
                            border: "3px solid #fff",
                            boxShadow: "0 0 0 2px rgba(0,0,0,0.06)",
                            mt: 0.5,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            Oct {24 - i}, 2023 • System
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                borderTop: "1px solid rgba(0,0,0,0.06)",
                p: 3,
                display: "flex",
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSelectedProduct(null);
                  handleOpenEditDrawer(selectedProduct);
                }}
                sx={{
                  borderWidth: 2,
                  borderColor: palette.primary,
                  color: palette.primary,
                  fontWeight: 700,
                }}
              >
                Edit Product
              </Button>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  background:
                    "linear-gradient(135deg, #003a4d 0%, #00526c 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow: "0 10px 24px rgba(0,82,108,0.18)",
                }}
              >
                Create PO
              </Button>
            </Box>
          </Box>
        ) : null}
      </Drawer>

      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Product</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={createForm.handleSubmit((values) =>
              createMutation.mutate(values),
            )}
            sx={{ pt: 1 }}
          >
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
              }}
            >
              <Controller
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Name"
                    error={Boolean(createForm.formState.errors.name)}
                    helperText={createForm.formState.errors.name?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="sku"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="SKU"
                    error={Boolean(createForm.formState.errors.sku)}
                    helperText={createForm.formState.errors.sku?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormControl
                    size="small"
                    error={Boolean(createForm.formState.errors.categoryId)}
                  >
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {createForm.formState.errors.categoryId ? (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1.75, mt: 0.5 }}
                      >
                        {createForm.formState.errors.categoryId.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />

              <Controller
                control={createForm.control}
                name="basePrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Base Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(createForm.formState.errors.basePrice)}
                    helperText={createForm.formState.errors.basePrice?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="purchasePrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Purchase Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(createForm.formState.errors.purchasePrice)}
                    helperText={
                      createForm.formState.errors.purchasePrice?.message
                    }
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="stockQuantity"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Stock Quantity"
                    inputProps={{ min: 0, step: 1 }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(createForm.formState.errors.stockQuantity)}
                    helperText={
                      createForm.formState.errors.stockQuantity?.message
                    }
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="reorderLevel"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Reorder Level"
                    inputProps={{ min: 0, step: 1 }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(createForm.formState.errors.reorderLevel)}
                    helperText={
                      createForm.formState.errors.reorderLevel?.message
                    }
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="unit"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Unit"
                    error={Boolean(createForm.formState.errors.unit)}
                    helperText={createForm.formState.errors.unit?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Description"
                    multiline
                    minRows={3}
                    sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}
                  />
                )}
              />

              <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
                <ProductImageUpload
                  form={createForm}
                  inputId="create-product-image"
                  placeholder="Upload an image or leave empty to use a placeholder."
                />
              </Box>
            </Box>

            {createMutation.error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {normalizeError(createMutation.error).message}
              </Alert>
            ) : null}

            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button
                onClick={() => setOpenCreateDialog(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Drawer
        anchor="right"
        open={Boolean(editingProduct)}
        onClose={handleCloseEditDrawer}
      >
        <Box sx={{ width: { xs: "100vw", sm: 520 }, p: 3 }}>
          <Typography variant="h2">Edit Product</Typography>
          {editingProduct ? (
            <Typography variant="caption" color="text.secondary">
              Product ID: {editingProduct.id}
            </Typography>
          ) : null}

          <Box
            component="form"
            onSubmit={updateForm.handleSubmit((values) =>
              updateMutation.mutate(values),
            )}
            sx={{ mt: 2 }}
          >
            <Stack spacing={2}>
              <Controller
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Name"
                    error={Boolean(updateForm.formState.errors.name)}
                    helperText={updateForm.formState.errors.name?.message}
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="sku"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="SKU"
                    error={Boolean(updateForm.formState.errors.sku)}
                    helperText={updateForm.formState.errors.sku?.message}
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormControl
                    size="small"
                    error={Boolean(updateForm.formState.errors.categoryId)}
                  >
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {updateForm.formState.errors.categoryId ? (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1.75, mt: 0.5 }}
                      >
                        {updateForm.formState.errors.categoryId.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />

              <Controller
                control={updateForm.control}
                name="basePrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Base Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(updateForm.formState.errors.basePrice)}
                    helperText={updateForm.formState.errors.basePrice?.message}
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="purchasePrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Purchase Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(updateForm.formState.errors.purchasePrice)}
                    helperText={
                      updateForm.formState.errors.purchasePrice?.message
                    }
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="stockQuantity"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Stock Quantity"
                    inputProps={{ min: 0, step: 1 }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(updateForm.formState.errors.stockQuantity)}
                    helperText={
                      updateForm.formState.errors.stockQuantity?.message
                    }
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="reorderLevel"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Reorder Level"
                    inputProps={{ min: 0, step: 1 }}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    error={Boolean(updateForm.formState.errors.reorderLevel)}
                    helperText={
                      updateForm.formState.errors.reorderLevel?.message
                    }
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="unit"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Unit"
                    error={Boolean(updateForm.formState.errors.unit)}
                    helperText={updateForm.formState.errors.unit?.message}
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <FormControl size="small">
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Description"
                    multiline
                    minRows={3}
                  />
                )}
              />

              <ProductImageUpload
                form={updateForm}
                inputId="update-product-image"
                placeholder="Keep current image or upload a new one."
              />
            </Stack>

            {updateMutation.error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {normalizeError(updateMutation.error).message}
              </Alert>
            ) : null}

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                onClick={handleCloseEditDrawer}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Update Product"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
