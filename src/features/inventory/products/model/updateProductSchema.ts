import { z } from "zod";

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Selling price must be 0 or more"),
  fixedCostPrice: z.number().min(0, "Fixed cost must be 0 or more"),
  stockQuantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity must be 0 or more"),
  reorderLevel: z
    .number()
    .int("Reorder level must be a whole number")
    .min(0, "Reorder level must be 0 or more"),
  unit: z.string().min(1, "Unit is required"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
});

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
