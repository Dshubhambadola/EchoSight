import { User } from 'oidc-client-ts';

const API_URL = 'http://localhost:3000/analytics';

export const AnalyticsService = {
    async getTrends(user: User | null | undefined) {
        if (!user) return [];

        const response = await fetch(`${API_URL}/trends`, {
            headers: {
                Authorization: `Bearer ${user.access_token}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch trends');
            return [];
        }

        return response.json();
    },

    async getDistribution(user: User | null | undefined) {
        if (!user) return [];

        const response = await fetch(`${API_URL}/distribution`, {
            headers: {
                Authorization: `Bearer ${user.access_token}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch distribution');
            return [];
        }

        return response.json();
    },
};
