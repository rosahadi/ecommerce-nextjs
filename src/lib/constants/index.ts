import {
  PaymentMethod,
  ProductStatus,
  Size,
  TargetAudience,
} from "@prisma/client";

export const APP_NAME = "Urban Edge";
export const APP_DESCRIPTION =
  "A modern ecommerce store built with Next.js";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 5;

export const PAYMENT_METHODS = Object.values(PaymentMethod);
export const DEFAULT_PAYMENT_METHOD = PaymentMethod.STRIPE;

export const targetAudiences = Object.entries(
  TargetAudience
).map(([key, value]) => ({
  label: key.charAt(0) + key.slice(1).toLowerCase(),
  value: value,
}));

export const signInDefaultValues = {
  email: "admin@example.com",
  password: "123456",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAGE_SIZE =
  Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: "",
  slug: "",
  category: [],
  targetAudience: TargetAudience.MEN,
  images: [],
  description: "",
  stock: 0,
  status: ProductStatus.IN_STOCK,
  price: 0,
  discountPercent: null,
  rating: 0,
  numReviews: 0,
  color: null,
  size: [] as Size[],
  material: null,
  isNew: false,
  bestSeller: false,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};
