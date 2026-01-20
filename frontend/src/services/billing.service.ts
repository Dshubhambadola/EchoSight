import { User } from 'oidc-client-ts';

const API_URL = 'http://localhost:3000/billing';

export const BillingService = {
    async createCheckoutSession(user: User | null | undefined) {
        if (!user) return null;

        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${user.access_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create checkout session:', errorText);
            throw new Error(errorText || 'Failed to create checkout session');
        }

        return response.json(); // Returns { url: string }
    },
};
