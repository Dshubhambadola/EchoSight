import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class BillingService {
    private stripe: Stripe;
    private readonly logger = new Logger(BillingService.name);
    private readonly webhookSecret: string;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>
    ) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_mock';
        this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_mock';
        this.stripe = new Stripe(apiKey, {
            apiVersion: '2025-12-15.clover' as any, // Cast to any to silence if local mismatch persists
        });
    }

    async createCheckoutSession(userId: string, email: string) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'EchoSight Pro',
                            description: 'Advanced Analytics & Sentiment History',
                        },
                        unit_amount: 2900, // $29.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Or 'subscription'
            success_url: 'http://localhost:5173/analytics?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/settings',
            client_reference_id: userId,
            customer_email: email,
        });

        return { url: session.url };
    }

    async handleWebhook(signature: string, payload: Buffer) {
        let event: Stripe.Event;

        try {
            // In development without real webhooks, we might bypass signature verification
            // if we are testing via simple POST requests.
            if (this.webhookSecret === 'whsec_mock') {
                event = JSON.parse(payload.toString());
            } else {
                event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
            }
        } catch (err: any) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.handleCheckoutCompleted(session);
                break;
            default:
                this.logger.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer as string;

        if (!userId) {
            this.logger.error('Checkout session missing client_reference_id (userId). Cannot link subscription.');
            return;
        }

        let subscription = await this.subscriptionRepository.findOne({ where: { userId } });

        if (!subscription) {
            subscription = this.subscriptionRepository.create({
                userId,
                stripeCustomerId,
                planType: 'pro',
                status: 'active',
            });
        } else {
            subscription.stripeCustomerId = stripeCustomerId;
            subscription.planType = 'pro';
            subscription.status = 'active';
        }

        await this.subscriptionRepository.save(subscription);
        this.logger.log(`Successfully provisioned Pro plan for user: ${userId}`);
    }

    async getSubscriptionStatus(userId: string): Promise<'active' | 'inactive'> {
        const sub = await this.subscriptionRepository.findOne({ where: { userId } });
        return sub?.status === 'active' ? 'active' : 'inactive';
    }
}
