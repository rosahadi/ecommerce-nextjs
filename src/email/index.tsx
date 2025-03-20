import { Resend } from "resend";
import { APP_NAME } from "@/lib/constants";
import PurchaseReceiptEmail from "./purchase-receipt";
import { Order } from "@/types";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a purchase receipt email to the customer
 */
export const sendPurchaseReceipt = async ({
  order,
}: {
  order: Order;
}) => {
  try {
    if (!order.user || !order.user.email) {
      console.error(
        "Missing user email for order:",
        order.id
      );
      return;
    }

    // Ensure numeric values are properly converted to numbers
    const processedOrder = {
      ...order,
      totalPrice: Number(order.totalPrice),
      itemsPrice: Number(order.itemsPrice),
      taxPrice: Number(order.taxPrice),
      shippingPrice: Number(order.shippingPrice),
      orderitems: order.orderitems.map((item) => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
    };

    const emailResult = await resend.emails.send({
      from: `${APP_NAME} <no-reply@rosah.dev>`,
      to: order.user.email,
      subject: `Order Confirmation #${order.id}`,
      react: await PurchaseReceiptEmail({
        order: processedOrder,
      }),
    });

    return emailResult;
  } catch (error) {
    throw error;
  }
};
