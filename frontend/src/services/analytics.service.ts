import axios from 'axios';
import { User } from 'oidc-client-ts';

const API_URL = 'http://localhost:3000/analytics';

export const AnalyticsService = {
    // Helper to build query string
    getQueryString(startDate?: Date | null, endDate?: Date | null): string {
        if (!startDate || !endDate) return '';
        return `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    },

    async getTrends(user: User | null | undefined) {
        if (!user) return [];
        try {
            const response = await axios.get(`${API_URL}/trends`, {
                headers: { Authorization: `Bearer ${user.access_token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch trends', error);
            return [];
        }
    },

    async getDailyTrends(user: User | null | undefined, startDate?: Date | null, endDate?: Date | null) {
        if (!user) return [];
        try {
            const query = AnalyticsService.getQueryString(startDate, endDate);
            const response = await axios.get(`${API_URL}/trends${query}`, {
                headers: { Authorization: `Bearer ${user.access_token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch daily trends', error);
            return [];
        }
    },

    async getPlatformDistribution(user: User | null | undefined, startDate?: Date | null, endDate?: Date | null) {
        if (!user) return [];
        try {
            const query = AnalyticsService.getQueryString(startDate, endDate);
            const response = await axios.get(`${API_URL}/distribution${query}`, {
                headers: { Authorization: `Bearer ${user.access_token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch platform distribution', error);
            return [];
        }
    },

    async getKeywords(user: User | null | undefined, startDate?: Date | null, endDate?: Date | null) {
        if (!user) return [];
        try {
            const query = AnalyticsService.getQueryString(startDate, endDate);
            const response = await axios.get(`${API_URL}/keywords${query}`, {
                headers: { Authorization: `Bearer ${user.access_token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch keywords', error);
            return [];
        }
    },

    async getAuthors(user: User | null | undefined, startDate?: Date | null, endDate?: Date | null) {
        if (!user) return [];
        try {
            const query = AnalyticsService.getQueryString(startDate, endDate);
            const response = await axios.get(`${API_URL}/authors${query}`, {
                headers: { Authorization: `Bearer ${user.access_token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch authors', error);
            return [];
        }
    },

    async generateSummary(user: User | null | undefined, startDate?: Date | null, endDate?: Date | null) {
        if (!user) return "Unauthorized";
        try {
            const query = AnalyticsService.getQueryString(startDate, endDate);
            const response = await axios.post(`${API_URL}/summary${query}`, {}, {
                headers: { Authorization: `Bearer ${user.access_token}` },
            });
            return response.data.summary;
        } catch (error) {
            console.error('Failed to generate summary', error);
            throw error;
        }
    }
};
