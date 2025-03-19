import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order";
import { notFound, redirect } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  if (
    order.userId !== session?.user.id &&
    session?.user.role !== "admin"
  ) {
    return redirect("/unauthorized");
  }

  let client_secret = null;

  if (order.paymentMethod === "STRIPE" && !order.isPaid) {
    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY as string
    );
    const paymentIntent =
      await stripe.paymentIntents.create({
        amount: Math.round(Number(order.totalPrice) * 100),
        currency: "USD",
        metadata: { orderId: order.id },
      });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress:
          order.shippingAddress as ShippingAddress,
      }}
      stripeClientSecret={client_secret}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
