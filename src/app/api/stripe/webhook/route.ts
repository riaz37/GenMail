import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    return new NextResponse("webhook error", { status: 400 });
  }

  const session = event.data.object;

  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = session as Stripe.Checkout.Session;
      
      if (!checkoutSession?.client_reference_id) {
        return new NextResponse("no userid", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string,
    {
          expand: ['items.data.price.product'],
        }
      );

      await db.stripeSubscription.create({
        data: {
          subscriptionId: subscription.id,
          customerId: checkoutSession.customer as string,
          currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          userId: checkoutSession.client_reference_id,
        }
      });
      break;

    case "invoice.payment_succeeded":
      const invoiceSession = session as Stripe.Invoice;
      if (!invoiceSession.subscription) break;

      await db.stripeSubscription.update({
        where: {
          subscriptionId: invoiceSession.subscription as string,
        },
        data: {
          currentPeriodEnd: new Date(
            (invoiceSession.lines.data[0]?.period.end || 0) * 1000
          ),
        }
      });
      break;

    case "customer.subscription.deleted":
      const deletedSubscription = session as Stripe.Subscription;
      await db.stripeSubscription.delete({
        where: {
          subscriptionId: deletedSubscription.id,
        }
      });
      break;

    case "customer.subscription.updated":
      const updatedSubscription = session as Stripe.Subscription;
      await db.stripeSubscription.update({
        where: {
          subscriptionId: updatedSubscription.id,
        },
        data: {
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        }
      });
      break;
  }

  return NextResponse.json({ message: "success" }, { status: 200 });
}
