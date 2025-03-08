"use server";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  convertToPlainObject,
  formatError,
} from "../utils";
import {
  LATEST_PRODUCTS_LIMIT,
  PAGE_SIZE,
} from "../constants";
import { revalidatePath } from "next/cache";
import {
  insertProductSchema,
  updateProductSchema,
} from "../schema";
import { z } from "zod";

// Get latest products
export async function getLatestProducts() {
  const prisma = new PrismaClient();
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

// Get single product by its slug
export async function getProductBySlug(slug: string) {
  const prisma = new PrismaClient();
  return await prisma.product.findFirst({
    where: { slug },
  });
}

// Get single product by its ID
export async function getProductById(productId: string) {
  const prisma = new PrismaClient();
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const prisma = new PrismaClient();

  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? { name: { contains: query, mode: "insensitive" } }
      : {};

  // Fix the category filter to use the proper array containment operator
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all"
      ? { category: { has: category } }
      : {};

  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== "all"
      ? { rating: { gte: Number(rating) } }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
        ? { price: "desc" }
        : sort === "rating"
        ? { rating: "desc" }
        : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a product
export async function deleteProduct(id: string) {
  const prisma = new PrismaClient();

  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists)
      throw new Error("Product not found");

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(
  data: z.infer<typeof insertProductSchema>
) {
  const prisma = new PrismaClient();

  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(
  data: z.infer<typeof updateProductSchema>
) {
  try {
    const prisma = new PrismaClient();

    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists)
      throw new Error("Product not found");

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all categories
export async function getAllCategories() {
  const prisma = new PrismaClient();

  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}
