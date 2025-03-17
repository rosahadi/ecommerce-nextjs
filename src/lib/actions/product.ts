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
  try {
    const data = await prisma.product.findMany({
      take: LATEST_PRODUCTS_LIMIT,
      orderBy: { createdAt: "desc" },
    });
    return convertToPlainObject(data);
  } finally {
    await prisma.$disconnect();
  }
}

// Get single product by its slug
export async function getProductBySlug(slug: string) {
  const prisma = new PrismaClient();
  try {
    const data = await prisma.product.findFirst({
      where: { slug },
    });
    return convertToPlainObject(data);
  } finally {
    await prisma.$disconnect();
  }
}

// Get single product by its ID
export async function getProductById(productId: string) {
  const prisma = new PrismaClient();
  try {
    const data = await prisma.product.findFirst({
      where: { id: productId },
    });
    return convertToPlainObject(data);
  } finally {
    await prisma.$disconnect();
  }
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
  try {
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
              gte: new Prisma.Decimal(price.split("-")[0]),
              lte: new Prisma.Decimal(price.split("-")[1]),
            },
          }
        : {};

    const ratingFilter: Prisma.ProductWhereInput =
      rating && rating !== "all"
        ? { rating: { gte: new Prisma.Decimal(rating) } }
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

    const dataCount = await prisma.product.count({
      where: {
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
      },
    });

    return {
      data: convertToPlainObject(data),
      totalPages: Math.ceil(dataCount / limit),
    };
  } finally {
    await prisma.$disconnect();
  }
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
  } finally {
    await prisma.$disconnect();
  }
}

// Create a product
export async function createProduct(
  data: z.infer<typeof insertProductSchema>
) {
  const prisma = new PrismaClient();
  try {
    // Validate the input data with the schema
    const validatedData = insertProductSchema.parse(data);

    // Create the product with properly typed data
    await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        category: validatedData.category,
        targetAudience: validatedData.targetAudience,
        images: validatedData.images,
        description: validatedData.description,
        stock: validatedData.stock,
        status: validatedData.status,
        price: new Prisma.Decimal(
          validatedData.price.toString()
        ),
        discountPercent: validatedData.discountPercent,
        color: validatedData.color,
        size: validatedData.size,
        material: validatedData.material,
        isNew: validatedData.isNew,
        bestSeller: validatedData.bestSeller,
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// Update a product
export async function updateProduct(
  data: z.infer<typeof updateProductSchema>
) {
  const prisma = new PrismaClient();
  try {
    // Validate the input data with the schema
    const validatedData = updateProductSchema.parse(data);

    const productExists = await prisma.product.findFirst({
      where: { id: validatedData.id },
    });

    if (!productExists)
      throw new Error("Product not found");

    // Update the product with properly typed data
    await prisma.product.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        category: validatedData.category,
        targetAudience: validatedData.targetAudience,
        images: validatedData.images,
        description: validatedData.description,
        stock: validatedData.stock,
        status: validatedData.status,
        price: new Prisma.Decimal(
          validatedData.price.toString()
        ),
        discountPercent: validatedData.discountPercent,
        color: validatedData.color,
        size: validatedData.size,
        material: validatedData.material,
        isNew: validatedData.isNew,
        bestSeller: validatedData.bestSeller,
      },
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: formatError(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// Get all categories
export async function getAllCategories() {
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
    });

    // Extract and flatten all categories from products
    const allCategories = products.flatMap(
      (product) => product.category
    );

    // Count occurrences of each category
    const categoryCount = allCategories.reduce(
      (acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Format the result to match your needs
    const result = Object.entries(categoryCount).map(
      ([category, count]) => ({
        category: [category],
        _count: count,
      })
    );

    return result;
  } finally {
    await prisma.$disconnect();
  }
}
