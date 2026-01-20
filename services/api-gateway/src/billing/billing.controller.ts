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
}
