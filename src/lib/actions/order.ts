"use server";

import {
  convertToPlainObject,
  formatError,
} from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart";
import { getUserById } from "./user";
import { insertOrderSchema } from "../schema";
import { prisma } from "@/db/prisma";
import {
  CartItem,
  PaymentResult,
  ShippingAddress,
  Order,
  InsertOrder,
  InsertOrderItem,
} from "@/types";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import {
  Prisma,
  OrderStatus,
  PaymentMethod,
} from "@prisma/client";
// import { sendPurchaseReceipt } from "@/email"; // Commented out email

// Create order and create the order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session)
      throw new Error("User is not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // Create order items array from cart items
    const orderItems: InsertOrderItem[] = cart.items.map(
      (item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
        price: item.price.toString(),
        name: item.name,
        slug: item.slug,
        image: item.image,
        color: item.color || null,
        size: item.size || [],
      })
    );

    // Create order object with proper validation
    const orderData: InsertOrder = {
      userId: user.id,
      shippingAddress: user.address as ShippingAddress,
      paymentMethod: user.paymentMethod as PaymentMethod,
      itemsPrice: cart.itemsPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
      orderitems: orderItems,
    };

    // Validate with Zod schema
    const order = insertOrderSchema.parse(orderData);

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(
      async (tx) => {
        // Create order
        const insertedOrder = await tx.order.create({
          data: {
            userId: order.userId,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            itemsPrice: Number(order.itemsPrice),
            shippingPrice: Number(order.shippingPrice),
            taxPrice: Number(order.taxPrice),
            totalPrice: Number(order.totalPrice),
            status: OrderStatus.PENDING,
          },
        });

        // Create order items from the cart items
        for (const item of cart.items as CartItem[]) {
          await tx.orderItem.create({
            data: {
              orderId: insertedOrder.id,
              productId: item.productId,
              quantity: item.quantity || 1,
              price: item.price,
              name: item.name,
              slug: item.slug,
              image: item.image,
              color: item.color || null,
              size:
                item.size && item.size.length > 0
                  ? item.size[0]
                  : null,
            },
          });
        }

        // Clear cart
        await tx.cart.update({
          where: { id: cart.id },
          data: {
            items: {
              deleteMany: {},
            },
            totalPrice: 0,
            taxPrice: 0,
            shippingPrice: 0,
            itemsPrice: 0,
          },
        });

        return insertedOrder.id;
      }
    );

    if (!insertedOrderId)
      throw new Error("Order not created");

    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
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
      message: formatError(error),
    };
  }
}

// Get order by id
export async function getOrderById(
  orderId: string
): Promise<Order | null> {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject(data) as Order | null;
}

// Update order to paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
    },
  });

  if (!order) throw new Error("Order not found");

  if (order.isPaid)
    throw new Error("Order is already paid");

  // Transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // Iterate over products and update stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.quantity } },
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
        status: OrderStatus.PROCESSING,
      },
    });
  });

  // Get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) throw new Error("Order not found");

  // Commented out email sending
  // sendPurchaseReceipt({
  //   order: {
  //     ...updatedOrder,
  //     shippingAddress:
  //       updatedOrder.shippingAddress as ShippingAddress,
  //     paymentResult:
  //       updatedOrder.paymentResult as PaymentResult,
  //   },
  // });
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authorized");

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map(
    (entry) => ({
      month: entry.month,
      totalSales: Number(entry.totalSales),
    })
  );

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales: totalSales._sum.totalPrice
      ? Number(totalSales._sum.totalPrice)
      : 0,
    latestSales,
    salesData,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const dataCount = await prisma.order.count({
    where: {
      ...queryFilter,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update order status
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  try {
    await prisma.order.update({
      where: { id },
      data: { status },
    });

    revalidatePath(`/order/${id}`);
    revalidatePath("/admin/orders");

    return {
      success: true,
      message: `Order status updated to ${status}`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to paid
export async function updateOrderToPaidCOD(
  orderId: string
) {
  try {
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Order marked as paid",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
        status: OrderStatus.DELIVERED,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Order has been marked delivered",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
