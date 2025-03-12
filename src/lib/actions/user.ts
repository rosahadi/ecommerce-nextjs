"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateUserSchema,
} from "../schema";
import { auth, signIn, signOut } from "@/auth";
import { hashPassword } from "../encrypt";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Get the session cart ID before signing in
    const sessionCartId = (await cookies()).get(
      "sessionCartId"
    )?.value;

    // Sign in the user
    await signIn("credentials", user);

    // Get the user ID after sign in
    const session = await auth();
    const userId = session?.user?.id;

    // Handle cart merging if we have both a session cart and a user
    if (sessionCartId && userId) {
      await prisma.$transaction(async (tx) => {
        // Get session cart with items
        const sessionCart = await tx.cart.findFirst({
          where: { sessionCartId: sessionCartId },
          include: { items: true },
        });

        if (!sessionCart) return; // No session cart to merge

        // Check if user already has a cart
        const userCart = await tx.cart.findFirst({
          where: { userId: userId },
          include: { items: true },
        });

        if (userCart) {
          // User has an existing cart - merge items
          for (const item of sessionCart.items) {
            const existingItem = userCart.items.find(
              (i) =>
                i.productId === item.productId &&
                i.color === item.color &&
                i.size === item.size
            );

            if (existingItem) {
              // Update quantity if item already exists
              await tx.cartItem.update({
                where: { id: existingItem.id },
                data: {
                  quantity:
                    existingItem.quantity + item.quantity,
                },
              });
            } else {
              // Add new item to user cart
              await tx.cartItem.create({
                data: {
                  cartId: userCart.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  color: item.color,
                  size: item.size,
                },
              });
            }
          }

          // Delete the session cart after merging
          await tx.cart.delete({
            where: { id: sessionCart.id },
          });
        } else {
          // User doesn't have a cart - assign session cart to user
          await tx.cart.update({
            where: { id: sessionCart.id },
            data: {
              userId: userId,
              sessionCartId: undefined, // Clear the session ID to make it a user cart
            },
          });
        }
      });
    }

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    // Check if this is a redirect error from Next.js auth
    if (
      error instanceof Error &&
      (error.message.includes("NEXT_REDIRECT") ||
        error.name === "RedirectError")
    ) {
      throw error;
    }
    return {
      success: false,
      message: "Invalid email or password",
    };
  }
}

// Sign user out
export async function signOutUser() {
  // Clear the sessionCartId cookie
  (await cookies()).delete("sessionCartId");

  await signOut();
}

// Sign up user
export async function signUpUser(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = await hashPassword(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return {
      success: true,
      message: "User registered successfully",
    };
  } catch (error) {
    // Check if this is a redirect error from Next.js auth
    if (
      error instanceof Error &&
      (error.message.includes("NEXT_REDIRECT") ||
        error.name === "RedirectError")
    ) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return user;
}

// Update the user's address
export async function updateUserAddress(
  data: ShippingAddress
) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update the user profile
export async function updateProfile(user: {
  name: string;
  email: string;
}) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all the users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update a user
export async function updateUser(
  user: z.infer<typeof updateUserSchema>
) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
