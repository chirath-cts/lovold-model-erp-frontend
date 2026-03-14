import { z } from "zod";

export const orderLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.string().min(1, "Order date is required"),
  lines: z.array(orderLineSchema).min(1, "At least one line is required"),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
