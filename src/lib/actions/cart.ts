"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem, CartItemPrisma } from "@/types";
import { addCartItemSchema } from "../schema";
import {
  calculateDiscountPrice,
  convertToPlainObject,
  formatError,
  calcPriceWithDiscounts,
  getPrimarySize,
} from "../utils";
import {
  Size,
  PrismaClient,
  CartItem as PrismaCartItem,
  Product,
  Cart,
} from "@prisma/client";

/**
 * Get the current user's cart session information
 */
const getCartSession = async () => {
  const sessionCartId = (await cookies()).get(
    "sessionCartId"
  )?.value;
  if (!sessionCartId) {
    throw new Error("Cart session not found");
  }

  const session = await auth();
  const userId = session?.user?.id
    ? (session.user.id as string)
    : undefined;

  return { sessionCartId, userId };
};

// Define a transaction type using PrismaClient
type PrismaTransaction = Omit<
  PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
>;

// Define the cart item with product for price calculations
type CartItemWithProduct = PrismaCartItem & {
  product: Product;
};

/**
 * Add an item to the user's cart
 */
export async function addItemToCart(data: CartItemPrisma) {
  try {
    // Get session information
    const { sessionCartId, userId } =
      await getCartSession();

    // Get current cart
    const cart = await getMyCart();

    // Ensure quantity is defined with a fallback to 1
    const quantity = data.quantity || 1;

    // Get primary size - required by schema
    // This handles the conversion from Size[] to Size for database storage
    const primarySize = getPrimarySize(data.size);

    // Parse and validate item data
    const validatedItem = addCartItemSchema.parse({
      productId: data.productId,
      quantity: quantity,
      color: data.color,
      size: primarySize,
    });

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: validatedItem.productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      if (!cart) {
        return await handleNewCart({
          tx,
          product,
          validatedItem: {
            ...validatedItem,
            quantity,
            size: primarySize,
          },
          sessionCartId,
          userId,
        });
      } else {
        return await handleExistingCart({
          tx,
          cart: cart as unknown as Cart & {
            items: CartItemWithProduct[];
          },
          product,
          validatedItem: {
            ...validatedItem,
            quantity,
            size: primarySize,
          },
        });
      }
    });
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

/**
 * Handle adding an item when creating a new cart
 */
async function handleNewCart({
  tx,
  product,
  validatedItem,
  sessionCartId,
  userId,
}: {
  tx: PrismaTransaction;
  product: Product;
  validatedItem: {
    productId: string;
    quantity: number;
    color?: string | null;
    size: Size;
  };
  sessionCartId: string;
  userId: string | undefined;
}): Promise<{ success: boolean; message: string }> {
  // Calculate the discounted price
  const discountedPrice =
    calculateDiscountPrice(
      product.price.toNumber(),
      product.discountPercent
    ) || 0;

  // Prepare cart item with product data for price calculation
  const cartItem: CartItem = {
    productId: validatedItem.productId,
    quantity: validatedItem.quantity,
    price: product.price.toNumber(),
    discountPercent: product.discountPercent || 0,
    discountedPrice: discountedPrice,
    itemTotal:
      (discountedPrice || product.price.toNumber()) *
      validatedItem.quantity,
    name: product.name,
    slug: product.slug,
    image: product.images[0],
    stock: product.stock,
    color: validatedItem.color || null,
    size: validatedItem.size,
  };

  // Calculate prices with discounts
  const newCartPrices = calcPriceWithDiscounts([cartItem]);

  // Create new cart with validated item
  await tx.cart.create({
    data: {
      userId: userId || null,
      sessionCartId: sessionCartId,
      itemsPrice: newCartPrices.itemsPrice,
      shippingPrice: newCartPrices.shippingPrice,
      taxPrice: newCartPrices.taxPrice,
      totalPrice: newCartPrices.totalPrice,
      items: {
        create: [
          {
            productId: validatedItem.productId,
            quantity: validatedItem.quantity,
            color: validatedItem.color || null,
            size: validatedItem.size,
          },
        ],
      },
    },
  });

  return {
    success: true,
    message: `${product.name} added to cart`,
  };
}

/**
 * Handle adding an item to an existing cart
 */
async function handleExistingCart({
  tx,
  cart,
  product,
  validatedItem,
}: {
  tx: PrismaTransaction;
  cart: Cart & {
    items: CartItemWithProduct[];
  };
  product: Product;
  validatedItem: {
    productId: string;
    quantity: number;
    color?: string | null;
    size: Size; // Single size for database
  };
}): Promise<{
  success: boolean;
  message: string;
}> {
  // Get existing cart items
  const cartItems = await tx.cartItem.findMany({
    where: { cartId: cart.id },
  });

  // Check if item is already in cart (matching product, color, size)
  const existItem = cartItems.find(
    (x) =>
      x.productId === validatedItem.productId &&
      x.color === (validatedItem.color || null) &&
      x.size === validatedItem.size
  );

  if (existItem) {
    await handleExistingCartItem({
      tx,
      existItem,
      validatedItem,
      product,
    });
  } else {
    await handleNewCartItem({
      tx,
      cart,
      validatedItem,
      product,
    });
  }

  // Update cart prices
  await updateCartPrices(tx, cart.id);

  return {
    success: true,
    message: `${product.name} ${existItem ? "updated in" : "added to"} cart`,
  };
}

/**
 * Handle adding a new item to an existing cart
 */
async function handleNewCartItem({
  tx,
  cart,
  validatedItem,
  product,
}: {
  tx: PrismaTransaction;
  cart: Cart;
  validatedItem: {
    productId: string;
    quantity: number;
    color?: string | null;
    size: Size;
  };
  product: Product;
}): Promise<void> {
  // Check stock
  const requestedQuantity = validatedItem.quantity;
  if (product.stock < requestedQuantity) {
    throw new Error(
      `Only ${product.stock} items available in stock`
    );
  }

  // Create a new cart item
  await tx.cartItem.create({
    data: {
      cartId: cart.id,
      productId: validatedItem.productId,
      quantity: requestedQuantity,
      color: validatedItem.color || null,
      size: validatedItem.size,
    },
  });
}

/**
 * Handle updating an existing cart item
 */
async function handleExistingCartItem({
  tx,
  existItem,
  validatedItem,
  product,
}: {
  tx: PrismaTransaction;
  existItem: PrismaCartItem;
  validatedItem: {
    productId: string;
    quantity: number;
    color?: string | null;
    size: Size;
  };
  product: Product;
}): Promise<void> {
  // Calculate new quantity
  const newQuantity =
    existItem.quantity + validatedItem.quantity;

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
}

/**
 * Update cart prices based on current items
 */
async function updateCartPrices(
  tx: PrismaTransaction,
  cartId: string
): Promise<void> {
  // Get updated cart items
  const updatedCartItems = await tx.cartItem.findMany({
    where: { cartId: cartId },
    include: { product: true },
  });

  // Transform to CartItem type for price calculation with discounts
  const cartItemsForPricing: CartItem[] =
    updatedCartItems.map((ci) => {
      const discountedPrice = calculateDiscountPrice(
        ci.product.price.toNumber(),
        ci.product.discountPercent
      );

      return {
        productId: ci.productId,
        quantity: ci.quantity,
        price: ci.product.price.toNumber(),
        discountPercent: ci.product.discountPercent,
        discountedPrice: discountedPrice,
        itemTotal:
          (discountedPrice || ci.product.price.toNumber()) *
          ci.quantity,
        color: ci.color,
        size: ci.size as Size,
        stock: ci.product.stock,
        name: ci.product.name,
        slug: ci.product.slug,
        image: ci.product.images[0] || "",
      };
    });

  // Calculate updated prices
  const updatedPrices = calcPriceWithDiscounts(
    cartItemsForPricing
  );

  // Save updated prices to database
  await tx.cart.update({
    where: { id: cartId },
    data: {
      itemsPrice: updatedPrices.itemsPrice,
      shippingPrice: updatedPrices.shippingPrice,
      taxPrice: updatedPrices.taxPrice,
      totalPrice: updatedPrices.totalPrice,
    },
  });
}

/**
 * Get current user's cart with all items and calculations
 */
export async function getMyCart() {
  try {
    // Get session cookie
    const sessionCartId = (await cookies()).get(
      "sessionCartId"
    )?.value;

    if (!sessionCartId) return undefined;

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id
      ? (session.user.id as string)
      : undefined;

    // Try to find a cart for this user first (if they're logged in)
    let cart = undefined;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId: userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // If no user cart, try to find a session cart
    if (!cart && sessionCartId) {
      cart = await prisma.cart.findFirst({
        where: { sessionCartId: sessionCartId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    if (!cart) return undefined;

    // Calculate total quantity of items in the cart
    const totalQuantity = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    // Transform cart items to match CartItem type and include discount calculations
    const transformedItems: CartItem[] = cart.items.map(
      (item) => {
        const regularPrice = item.product.price.toNumber();
        const discountPercent =
          item.product.discountPercent;
        const discountedPrice = calculateDiscountPrice(
          regularPrice,
          discountPercent
        );

        return {
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: (item.size as Size) || null,
          stock: item.product.stock,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0] || "",
          price: regularPrice,
          discountPercent: discountPercent,
          discountedPrice: discountedPrice,
          itemTotal: Number(
            (discountedPrice * item.quantity).toFixed(2)
          ),
        };
      }
    );
    // Recalculate cart prices based on discounted prices
    const recalculatedPrices = calcPriceWithDiscounts(
      transformedItems
    );

    // Convert decimals and return
    return convertToPlainObject({
      ...cart,
      items: transformedItems,
      ...recalculatedPrices,
      totalQuantity,
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    return undefined;
  }
}

/**
 * Remove an item from the cart (completely or reduce quantity)
 */
export async function removeItemFromCart(
  productId: string,
  removeAll: boolean = false,
  color?: string | null,
  size?: Size | Size[]
) {
  try {
    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // Get user cart
    const cart = await getMyCart();
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Handle size - convert to a single Size value
    const primarySize = getPrimarySize(size);

    // Use transaction for data consistency
    return await prisma.$transaction(async (tx) => {
      // Find the specific cart item
      const cartItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: productId,
          color: color || null,
          size: primarySize,
        },
      });

      if (!cartItem) {
        throw new Error("Item not found in cart");
      }

      if (cartItem.quantity > 1 && !removeAll) {
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

      // Update cart prices
      await updateCartPrices(tx, cart.id);

      return {
        success: true,
        message: `${product.name} was ${removeAll ? "removed from" : "updated in"} cart`,
      };
    });
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/**
 * Get count of items in the cart (for badge display)
 */
export async function getCartItemCount() {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get(
      "sessionCartId"
    )?.value;
    if (!sessionCartId) return 0;

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id
      ? (session.user.id as string)
      : undefined;

    // Try to find a cart with user ID first (if logged in)
    let cart = undefined;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId: userId },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });
    }

    // If no user cart found, try to find a session cart
    if (!cart && sessionCartId) {
      cart = await prisma.cart.findFirst({
        where: { sessionCartId: sessionCartId },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      });
    }

    if (!cart) return 0;

    // Calculate total quantity
    const totalQuantity = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    return totalQuantity;
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}
