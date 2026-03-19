import { useEffect, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, type Path, type UseFormReturn } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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
import { DataTable } from "@/shared/ui/DataTable";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { FilterBar } from "@/shared/ui/FilterBar";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";
import { StatusBadge } from "@/shared/ui/StatusBadge";

const createFormDefaults: CreateProductFormValues = {
  name: "",
  sku: "",
  categoryId: "",
  unitPrice: 0,
  fixedCostPrice: 0,
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
  unitPrice: 0,
  fixedCostPrice: 0,
  stockQuantity: 0,
  reorderLevel: 0,
  unit: "pcs",
  status: "active",
  description: "",
  imageUrl: null,
};

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

type ProductFormWithImage = CreateProductFormValues | UpdateProductFormValues;

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
  const imageUrl = form.watch(imageFieldName) ?? null;
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setFileName(null);
    }
  }, [imageUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      form.setError(imageFieldName, { type: "validate", message: "Only image files are allowed" });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      form.setError(imageFieldName, { type: "validate", message: "Image must be 1MB or smaller" });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        form.setValue(imageFieldName, reader.result, { shouldDirty: true });
        form.clearErrors(imageFieldName);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    form.setValue(imageFieldName, null, { shouldDirty: true });
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
        {fileName ? (
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
          {placeholder ?? "Upload JPG, PNG, or WebP up to 1MB. Keeps existing image if none selected."}
        </Typography>
      )}

      {form.formState.errors.imageUrl ? (
        <Typography variant="caption" color="error">
          {form.formState.errors.imageUrl.message}
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
        unitPrice: values.unitPrice,
        fixedCostPrice: values.fixedCostPrice,
        stockQuantity: values.stockQuantity,
        reorderLevel: values.reorderLevel,
        unit: values.unit.trim(),
        status: values.status,
        description: values.description?.trim() ?? "",
        imageUrl: values.imageUrl ?? null,
        currency: "NOK",
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
        unitPrice: values.unitPrice,
        fixedCostPrice: values.fixedCostPrice,
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
      unitPrice: product.unitPrice,
      fixedCostPrice: product.fixedCostPrice,
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

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return <LoadingState label="Loading products..." />;
  }

  if (categoriesQuery.error || productsQuery.error) {
    return <ErrorState message="Failed to load products." />;
  }

  const categoryLookup = new Map(categories.map((item) => [item.id, item.name]));
  const rows = products
    .filter((product) =>
      categoryId ? product.categoryId === categoryId : true,
    )
    .filter((product) =>
      [product.name, product.sku].join(" ").toLowerCase().includes(search.toLowerCase()),
    )
    .map((product) => ({
      ...product,
      stockHealth:
        product.stockQuantity <= product.reorderLevel
          ? "critical"
          : product.stockQuantity <= product.reorderLevel * 1.4
            ? "low"
            : "healthy",
    }));

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h1">Products Inventory</Typography>
          <Typography variant="body2" color="text.secondary">
            Stock health, pricing, and category mapping in one place.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpenCreateDialog}
          disabled={categories.length === 0}
        >
          Add Product
        </Button>
      </Box>

      <FilterBar>
        <Box sx={{ flex: 2, minWidth: 220 }}>
          <SearchInput
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={setSearch}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
          {rows.length} products
        </Typography>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try another search or category filter."
        />
      ) : (
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "sku",
              header: "Product",
              render: (row) => (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {row.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.sku}
                  </Typography>
                </Box>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (row) => categoryLookup.get(row.categoryId) ?? "-",
            },
            {
              key: "price",
              header: "Selling Price",
              align: "right",
              render: (row) => <CurrencyText value={row.unitPrice} />,
            },
            {
              key: "cost",
              header: "Fixed Cost",
              align: "right",
              render: (row) => <CurrencyText value={row.fixedCostPrice} />,
            },
            {
              key: "stock",
              header: "Stock",
              align: "right",
              render: (row) => `${row.stockQuantity} ${row.unit}`,
            },
            {
              key: "health",
              header: "Stock Status",
              render: (row) => <StatusBadge value={row.stockHealth} />,
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              render: (row) => (
                <Button
                  size="small"
                  onClick={() => handleOpenEditDrawer(row)}
                >
                  Edit
                </Button>
              ),
            },
          ]}
        />
      )}

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
            onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
            sx={{ pt: 1 }}
          >
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
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
                  <FormControl size="small" error={Boolean(createForm.formState.errors.categoryId)}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {createForm.formState.errors.categoryId ? (
                      <Typography variant="caption" color="error" sx={{ ml: 1.75, mt: 0.5 }}>
                        {createForm.formState.errors.categoryId.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />

              <TextField size="small" label="Currency" value="NOK" disabled />

              <Controller
                control={createForm.control}
                name="unitPrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Selling Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(createForm.formState.errors.unitPrice)}
                    helperText={createForm.formState.errors.unitPrice?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="fixedCostPrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Fixed Cost Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(createForm.formState.errors.fixedCostPrice)}
                    helperText={createForm.formState.errors.fixedCostPrice?.message}
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
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(createForm.formState.errors.stockQuantity)}
                    helperText={createForm.formState.errors.stockQuantity?.message}
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
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(createForm.formState.errors.reorderLevel)}
                    helperText={createForm.formState.errors.reorderLevel?.message}
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
            onSubmit={updateForm.handleSubmit((values) => updateMutation.mutate(values))}
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
                  <FormControl size="small" error={Boolean(updateForm.formState.errors.categoryId)}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {updateForm.formState.errors.categoryId ? (
                      <Typography variant="caption" color="error" sx={{ ml: 1.75, mt: 0.5 }}>
                        {updateForm.formState.errors.categoryId.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />

              <TextField size="small" label="Currency" value="NOK" disabled />

              <Controller
                control={updateForm.control}
                name="unitPrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Selling Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(updateForm.formState.errors.unitPrice)}
                    helperText={updateForm.formState.errors.unitPrice?.message}
                  />
                )}
              />

              <Controller
                control={updateForm.control}
                name="fixedCostPrice"
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    label="Fixed Cost Price"
                    inputProps={{ min: 0, step: "0.01" }}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(updateForm.formState.errors.fixedCostPrice)}
                    helperText={updateForm.formState.errors.fixedCostPrice?.message}
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
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(updateForm.formState.errors.stockQuantity)}
                    helperText={updateForm.formState.errors.stockQuantity?.message}
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
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(updateForm.formState.errors.reorderLevel)}
                    helperText={updateForm.formState.errors.reorderLevel?.message}
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

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={handleCloseEditDrawer} disabled={updateMutation.isPending}>
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
    </Stack>
  );
}
