import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_mock';
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
}
