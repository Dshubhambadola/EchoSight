import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard, Unprotected } from 'nest-keycloak-connect';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Post('checkout')
    async createCheckout(@Request() req: any) {
        try {
            const user = req.user;
            console.log('Creating checkout for user:', user);
            // In a real app, extract ID/Email from Keycloak token
            return await this.billingService.createCheckoutSession(
                user?.sub || 'unknown_user',
                user?.email || 'test@example.com',
            );
        } catch (error) {
            console.error('Billing Error:', error);
            throw error;
        }
    }

    @Post('webhook')
    @Unprotected()
    async webhook(@Request() req: any) {
        const sig = req.headers['stripe-signature'];
        // NestJS body parser issues with Stripe webhooks are common. 
        // We assume req.rawBody is configured in main.ts if real webhooks are used.
        // For our test, we'll try to use req.body directly if it's already parsed as buffer or json.

        let payload: any;
        if (req.rawBody) {
            payload = req.rawBody;
        } else if (Buffer.isBuffer(req.body)) {
            payload = req.body;
        } else {
            payload = Buffer.from(JSON.stringify(req.body));
        }

        try {
            return await this.billingService.handleWebhook(sig, payload);
        } catch (err: any) {
            console.error('Webhook processing failed:', err);
            // Return 400 so Stripe knows we failed
            throw err;
        }
    }
}
