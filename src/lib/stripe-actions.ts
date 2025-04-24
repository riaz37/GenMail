'use server'

import { auth } from "@clerk/nextjs/server";
import { stripe } from "./stripe";
import { redirect } from "next/navigation";
import { db } from "@/server/db";

export async function createCheckoutSession() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('User not found');
    }

    // Verify STRIPE_PRICE_ID exists
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
        throw new Error('STRIPE_PRICE_ID is not configured');
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
            client_reference_id: userId,
        });

        if (!session.url) {
            throw new Error('Failed to create checkout session');
        }

        redirect(session.url);
    } catch (error) {
        console.error('Stripe checkout session creation failed:', error);
        throw error;
    }
}

export async function createBillingPortalSession() {
    const { userId } = await auth();
    if (!userId) {
        return false
    }
    const subscription = await db.stripeSubscription.findUnique({
        where: { userId: userId },
    });
    if (!subscription?.customerId) {
        throw new Error('Subscription not found');
    }
    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    });
    redirect(session.url!)
}

export async function getSubscriptionStatus() {
    const { userId } = await auth();
    if (!userId) {
        return false
    }
    const subscription = await db.stripeSubscription.findUnique({
        where: { userId: userId },
    });
    if (!subscription) {
        return false;
    }
    return subscription.currentPeriodEnd > new Date();
}

