"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import {
  convertToPlainObject,
  formatError,
  round2,
} from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../schema";
import { revalidatePath } from "next/cache";
import { Size } from "@prisma/client";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce(
        (acc, item) =>
          acc + Number(item.price) * (item.quantity || 1),
        0
      )
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(
      itemsPrice + taxPrice + shippingPrice
    );

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

const normalizeSize = (
  size: Size | Size[] | string | null | undefined
): Size | undefined => {
  if (Array.isArray(size) && size.length > 0) {
    // If size is an array, return the first element
    return size[0] as Size;
  }
  if (size && typeof size === "string") {
    // If size is a string, cast it to the Size enum
    return size as Size;
  }
  return size as Size | undefined;
};

export async function addItemToCart(data: CartItem) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get(
      "sessionCartId"
    )?.value;
    if (!sessionCartId)
      throw new Error("Cart session not found");

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id
      ? (session.user.id as string)
      : undefined;

    // Get cart
    const cart = await getMyCart();

    // Parse and validate item
    const item = cartItemSchema.parse(data);

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    // Normalize size data
    const selectedSize = normalizeSize(item.size);

    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      if (!cart) {
        // Create new cart object
        const newCart = {
          userId: userId,
          sessionCartId: sessionCartId,
          ...calcPrice([
            {
              ...item,
              quantity: item.quantity || 1,
              price: product.price.toNumber(),
            },
          ]),
        };

        // Add to database with properly typed cart item
        await tx.cart.create({
          data: {
            ...newCart,
            items: {
              create: [
                {
                  productId: item.productId,
                  quantity: item.quantity || 1,
                  color: item.color || null,
                  size: selectedSize,
                },
              ],
            },
          },
        });

        // Revalidate product page
        revalidatePath(`/product/${product.slug}`);

        return {
          success: true,
          message: `${product.name} added to cart`,
        };
      } else {
        // Get existing cart items
        const cartItems = await tx.cartItem.findMany({
          where: { cartId: cart.id },
        });

        // Check if item is already in cart (matching product, color, size)
        const existItem = cartItems.find(
          (x) =>
            x.productId === item.productId &&
            x.color === (item.color || null) &&
            x.size === selectedSize
        );

        if (existItem) {
          // Calculate new quantity
          const newQuantity =
            existItem.quantity + (item.quantity || 1);

          // Check stock
          if (product.stock < newQuantity) {
            throw new Error(
              `Only ${product.stock} items available in stock`
            );
          }

          // Update the quantity of the existing item
          await tx.cartItem.update({
            where: { id: existItem.id },
            data: { quantity: newQuantity },
          });
        } else {
          // If item does not exist in cart
          // Check stock
          const requestedQuantity = item.quantity || 1;
          if (product.stock < requestedQuantity)
            throw new Error(
              `Only ${product.stock} items available in stock`
            );

          // Create a new cart item
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: requestedQuantity,
              color: item.color || null,
              size: selectedSize,
            },
          });
        }

        // Get updated cart items to recalculate prices
        const updatedCartItems = await tx.cartItem.findMany(
          {
            where: { cartId: cart.id },
            include: { product: true },
          }
        );

        // Transform to CartItem type for price calculation
        const cartItemsForPricing = updatedCartItems.map(
          (ci) => ({
            productId: ci.productId,
            quantity: ci.quantity,
            price: ci.product.price.toNumber(),
            color: ci.color,
            size: ci.size ? [ci.size] : [],
            stock: ci.product.stock,
            name: ci.product.name,
            slug: ci.product.slug,
            image: ci.product.images[0] || "",
          })
        );

        // Save updated prices to database
        await tx.cart.update({
          where: { id: cart.id },
          data: {
            ...calcPrice(cartItemsForPricing),
          },
        });

        revalidatePath(`/product/${product.slug}`);

        return {
          success: true,
          message: `${product.name} ${existItem ? "updated in" : "added to"} cart`,
        };
      }
    });
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get(
      "sessionCartId"
    )?.value;
    if (!sessionCartId)
      throw new Error("Cart session not found");

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id
      ? (session.user.id as string)
      : undefined;

    // Get user cart from database
    const cart = await prisma.cart.findFirst({
      where: userId
        ? { userId: userId }
        : { sessionCartId: sessionCartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) return undefined;

    // Calculate total quantity of items in the cart
    const totalQuantity = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Transform cart items to match CartItem type
    const transformedItems = cart.items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      size: item.size ? [item.size] : [],
      stock: item.product.stock,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0] || "",
      price: item.product.price.toNumber(),
    }));

    // Convert decimals and return
    return convertToPlainObject({
      ...cart,
      items: transformedItems,
      itemsPrice: cart.itemsPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
      totalQuantity,
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    return undefined;
  }
}

export async function removeItemFromCart(
  productId: string,
  color?: string | null,
  size?: string | null
) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get(
      "sessionCartId"
    )?.value;
    if (!sessionCartId)
      throw new Error("Cart session not found");

    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Normalize size
    const normalizedSize = normalizeSize(size);

    // Use transaction for data consistency
    return await prisma.$transaction(async (tx) => {
      // Find the specific cart item
      const cartItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: productId,
          color: color || null,
          size: normalizedSize,
        },
      });

      if (!cartItem)
        throw new Error("Item not found in cart");

      if (cartItem.quantity > 1) {
        // Decrease quantity
        await tx.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity: cartItem.quantity - 1 },
        });
      } else {
        // Remove from cart
        await tx.cartItem.delete({
          where: { id: cartItem.id },
        });
      }

      // Get updated cart items to recalculate prices
      const updatedCartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      });

      // Transform to CartItem type for price calculation
      const cartItemsForPricing = updatedCartItems.map(
        (ci) => ({
          productId: ci.productId,
          quantity: ci.quantity,
          price: ci.product.price.toNumber(),
          color: ci.color,
          size: ci.size ? [ci.size] : [],
          stock: ci.product.stock,
          name: ci.product.name,
          slug: ci.product.slug,
          image: ci.product.images[0] || "",
        })
      );

      // Update cart with new prices
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          ...calcPrice(cartItemsForPricing),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} was removed from cart`,
      };
    });
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// New function to merge guest cart with user cart upon login
export async function mergeGuestCartWithUserCart(
  userId: string,
  sessionCartId: string
) {
  try {
    // Check if both user and session carts exist
    const userCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    const sessionCart = await prisma.cart.findFirst({
      where: { sessionCartId, userId: null },
      include: { items: true },
    });

    // If no session cart or it's empty, nothing to merge
    if (!sessionCart || sessionCart.items.length === 0) {
      return {
        success: true,
        message: "No items to merge",
      };
    }

    // Use transaction for data consistency
    return await prisma.$transaction(async (tx) => {
      if (!userCart) {
        // If user has no cart, simply update the session cart with userId
        await tx.cart.update({
          where: { id: sessionCart.id },
          data: { userId },
        });
      } else {
        // Merge items from session cart to user cart
        for (const sessionItem of sessionCart.items) {
          // Check if item already exists in user cart
          const existingItem = userCart.items.find(
            (item) =>
              item.productId === sessionItem.productId &&
              item.color === sessionItem.color &&
              item.size === sessionItem.size
          );

          if (existingItem) {
            // Update quantity of existing item
            await tx.cartItem.update({
              where: { id: existingItem.id },
              data: {
                quantity:
                  existingItem.quantity +
                  sessionItem.quantity,
              },
            });
          } else {
            // Add new item to user cart
            await tx.cartItem.create({
              data: {
                cartId: userCart.id,
                productId: sessionItem.productId,
                quantity: sessionItem.quantity,
                color: sessionItem.color,
                size: sessionItem.size,
              },
            });
          }
        }

        // Get all product information for updated user cart
        const userCartItems = await tx.cartItem.findMany({
          where: { cartId: userCart.id },
          include: { product: true },
        });

        // Calculate new prices
        const cartItemsForPricing = userCartItems.map(
          (ci) => ({
            productId: ci.productId,
            quantity: ci.quantity,
            price: ci.product.price.toNumber(),
            color: ci.color,
            size: ci.size ? [ci.size] : [],
            stock: ci.product.stock,
            name: ci.product.name,
            slug: ci.product.slug,
            image: ci.product.images[0] || "",
          })
        );

        // Update user cart
        await tx.cart.update({
          where: { id: userCart.id },
          data: {
            ...calcPrice(cartItemsForPricing),
          },
        });

        // Delete session cart
        await tx.cart.delete({
          where: { id: sessionCart.id },
        });
      }

      return {
        success: true,
        message: "Cart merged successfully",
      };
    });
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
