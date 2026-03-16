import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { queryClient } from "@/app/queryClient";
import { categoriesService } from "@/services/endpoints/categoriesService";
import { useCategories, useProducts } from "@/services/hooks/useDomainQueries";
import { queryKeys } from "@/shared/constants/queryKeys";
import { DataTable } from "@/shared/ui/DataTable";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SearchInput } from "@/shared/ui/SearchInput";

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
      productCount: products.filter((product) => product.categoryId === category.id).length,
    }));

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h1">Product Categories</Typography>
          <Typography variant="body2" color="text.secondary">
            Category structure used across inventory and discounts.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Add Category
        </Button>
      </Box>

      <Box sx={{ maxWidth: 420 }}>
        <SearchInput
          placeholder="Search categories..."
          value={search}
          onChange={setSearch}
        />
      </Box>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {row.name}
              </Typography>
            ),
          },
          {
            key: "description",
            header: "Description",
            render: (row) => row.description,
          },
          {
            key: "count",
            header: "Products",
            align: "right",
            render: (row) => row.productCount,
          },
        ]}
      />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
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
    </Stack>
  );
}
