import axios from 'axios';
import { User } from 'oidc-client-ts';

const API_URL = 'http://localhost:3000/analytics';

export const AnalyticsService = {
    async getTrends(user: User | null | undefined) {
        if (!user) return [];

        try {
            const response = await axios.get(`${API_URL}/trends`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch trends', error);
            return [];
        }
    },

    async getDistribution(user: User | null | undefined) {
        if (!user) return [];

        try {
            const response = await axios.get(`${API_URL}/distribution`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch distribution', error);
            return [];
        }
    },
};
