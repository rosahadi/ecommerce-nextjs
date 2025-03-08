import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import {
  OrderStatus,
  PaymentMethod,
  ProductStatus,
  Size,
  TargetAudience,
} from "@prisma/client";

// Utility schemas
const currency = z
  .string()
  .refine(
    (value) =>
      /^\d+(\.\d{2})?$/.test(
        formatNumberWithDecimal(Number(value))
      ),
    "Price must have exactly two decimal places"
  );

const uuid = z.string().uuid("Invalid UUID format");

// Schema for Product model
export const productSchema = z.object({
  id: uuid,
  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters"),
  category: z.array(
    z
      .string()
      .min(3, "Category must be at least 3 characters")
  ),
  targetAudience: z.nativeEnum(TargetAudience),
  images: z
    .array(z.string())
    .min(1, "Product must have at least one image"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters"),
  stock: z.number().int().nonnegative(),
  status: z
    .nativeEnum(ProductStatus)
    .default(ProductStatus.IN_STOCK),
  price: z.number().positive("Price must be positive"),
  salePrice: z
    .number()
    .positive("Sale price must be positive")
    .optional()
    .nullable(),
  discountPercent: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().int().nonnegative().default(0),
  color: z.string().optional().nullable(),
  size: z.array(z.nativeEnum(Size)).optional().nullable(),
  material: z.string().optional().nullable(),
  isNew: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schemas for inserting/updating products
export const insertProductSchema = productSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    rating: true,
    numReviews: true,
  })
  .extend({
    price: currency,
    salePrice: currency.optional(),
    rating: z
      .string()
      .default("0")
      .transform((val) => Number(val)),
    size: z.array(z.nativeEnum(Size)).default([]),
  });

export const updateProductSchema =
  insertProductSchema.extend({
    id: uuid,
  });

// Schema for User model
export const userSchema = z.object({
  id: uuid,
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  emailVerified: z.date().nullable(),
  image: z
    .string()
    .url("Invalid image URL")
    .optional()
    .nullable(),
  password: z.string().optional().nullable(),
  role: z.string().default("user"),
  address: z.record(z.any()).optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schemas for user authentication
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const signUpFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(
        6,
        "Confirm password must be at least 6 characters"
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

// Schema for Account model
export const accountSchema = z.object({
  userId: uuid,
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  access_token: z.string().optional().nullable(),
  expires_at: z.number().int().optional().nullable(),
  token_type: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for Session model
export const sessionSchema = z.object({
  sessionToken: z.string(),
  userId: uuid,
  expires: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for VerificationToken model
export const verificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
});

// Cart and CartItem schemas
export const cartItemSchema = z.object({
  id: z.string().optional(),
  cartId: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be positive")
    .default(1)
    .optional(),
  color: z.string().optional().nullable(),
  size: z.array(z.nativeEnum(Size)),
  stock: z.number().int().nonnegative(),
  name: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional(),
  price: z
    .number()
    .positive("Price must be a positive number")
    .optional(),
});

export const cartSchema = z.object({
  id: uuid,
  userId: uuid.optional().nullable(),
  sessionCartId: z.string(),
  itemsPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  shippingPrice: z.number().nonnegative(),
  taxPrice: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(cartItemSchema).optional(),
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z
    .string()
    .min(1, "Session cart id is required"),
  userId: uuid.optional().nullable(),
});

// Shipping and address schemas
export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(3, "Name must be at least 3 characters"),
  streetAddress: z
    .string()
    .min(3, "Address must be at least 3 characters"),
  city: z
    .string()
    .min(3, "City must be at least 3 characters"),
  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters"),
  country: z
    .string()
    .min(3, "Country must be at least 3 characters"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Order and OrderItem schemas
export const orderItemSchema = z.object({
  orderId: uuid,
  productId: uuid,
  qty: z.number().int().positive(),
  price: z.number().positive(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
});

export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});

export const orderSchema = z.object({
  id: uuid,
  userId: uuid,
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentResult: z.record(z.any()).optional().nullable(),
  itemsPrice: z.number().positive(),
  shippingPrice: z.number().nonnegative(),
  taxPrice: z.number().nonnegative(),
  totalPrice: z.number().positive(),
  isPaid: z.boolean().default(false),
  paidAt: z.date().optional().nullable(),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional().nullable(),
  status: z
    .nativeEnum(OrderStatus)
    .default(OrderStatus.PENDING),
  createdAt: z.date(),
  orderitems: z.array(orderItemSchema).optional(),
});

export const insertOrderSchema = z.object({
  userId: uuid,
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.nativeEnum(PaymentMethod),
  shippingAddress: shippingAddressSchema,
});

// Payment result schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

// Review schema
export const reviewSchema = z.object({
  id: uuid,
  userId: uuid,
  productId: uuid,
  rating: z.number().int().min(1).max(5),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters"),
  isVerifiedPurchase: z.boolean().default(true),
  createdAt: z.date(),
});

export const insertReviewSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters"),
  productId: uuid,
  userId: uuid,
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

// User profile update schemas
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

export const updateUserSchema = updateProfileSchema.extend({
  id: uuid,
  role: z.string().min(1, "Role is required"),
});
