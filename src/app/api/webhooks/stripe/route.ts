import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
  {
    apiVersion: "2025-02-24.acacia",
  }
);

export async function POST(req: NextRequest) {
  try {
    // Get the signature from the headers
    const signature = req.headers.get(
      "stripe-signature"
    ) as string;

    // Verify and construct the event
    const event = await stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    // Handle the specific event type
    if (event.type === "charge.succeeded") {
      const { object } = event.data;

      await updateOrderToPaid({
        orderId: object.metadata.orderId,
        paymentResult: {
          id: object.id,
          status: "COMPLETED",
          email_address: object.billing_details.email!,
          pricePaid: Number(
            (object.amount / 100).toFixed()
          ),
        },
      });

      return NextResponse.json({
        message: "updateOrderToPaid was successful",
      });
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data
        .object as Stripe.PaymentIntent;

      // Get the charge from the payment intent to get billing details
      const charges = await stripe.charges.list({
        payment_intent: paymentIntent.id,
      });

      if (charges.data.length > 0) {
        const charge = charges.data[0];
        await updateOrderToPaid({
          orderId: paymentIntent.metadata.orderId,
          paymentResult: {
            id: paymentIntent.id,
            status: "COMPLETED",
            email_address:
              charge.billing_details.email || "",
            pricePaid: Number(
              (paymentIntent.amount / 100).toFixed()
            ),
          },
        });

        return NextResponse.json({
          message: "updateOrderToPaid was successful",
        });
      }
    }

    // Return a response for other event types
    return NextResponse.json({
      message: `Webhook received: ${event.type}`,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
