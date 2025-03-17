import { z } from "zod";
import {
  productSchema,
  insertProductSchema,
  cartSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  orderSchema,
  orderItemSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  paymentResultSchema,
  reviewSchema,
  insertReviewSchema,
  userSchema,
  cartItemPrismaSchema,
  addProductToCartClientSchema,
} from "@/lib/schema";

// Product type definitions
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<
  typeof insertProductSchema
>;
export type AddProductToCartClientSchema = z.infer<
  typeof addProductToCartClientSchema
>;

// Cart type definitions
export type Cart = z.infer<typeof cartSchema>;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CartItemPrisma = z.infer<
  typeof cartItemPrismaSchema
>;

// Address type definitions
export type ShippingAddress = z.infer<
  typeof shippingAddressSchema
>;

// Order type definitions
export type Order = z.infer<typeof orderSchema> & {
  user: { name: string; email: string };
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type InsertOrderItem = z.infer<
  typeof insertOrderItemSchema
>;

// Payment type definitions
export type PaymentResult = z.infer<
  typeof paymentResultSchema
>;

// Review type definitions
export type Review = z.infer<typeof reviewSchema> & {
  user?: { name: string };
};
export type InsertReview = z.infer<
  typeof insertReviewSchema
>;

// User type definitions
export type User = z.infer<typeof userSchema>;

// Utility type for partial updates
export type PartialWithId<T> = Partial<T> & { id: string };
