import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../../db/prisma';
import { sendSuccess, sendError } from '../../utils/response';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any
});

export class PaymentsController {
    static async createCheckoutSession(req: any, res: Response, next: NextFunction) {
        try {
            const { priceId } = req.body;
            const user = await prisma.user.findUnique({ where: { id: req.user.id } });

            if (!user) return sendError(res, 'User not found', 404);

            const session = await stripe.checkout.sessions.create({
                customer: user.stripe_customer_id || undefined,
                customer_email: user.stripe_customer_id ? undefined : user.email,
                payment_method_types: ['card'],
                line_items: [{ price: priceId, quantity: 1 }],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/billing`,
                metadata: { userId: user.id.toString() }
            });

            return sendSuccess(res, { url: session.url });
        } catch (error) {
            next(error);
        }
    }

    static async handleWebhook(req: any, res: Response, next: NextFunction) {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig as string,
                process.env.STRIPE_WEBHOOK_SECRET || ''
            );
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = parseInt(session.metadata?.userId || '0');
            
            await prisma.user.update({
                where: { id: userId },
                data: {
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    subscription_tier: 'PRO' // Simplified logic
                }
            });
        }

        res.json({ received: true });
    }
}
