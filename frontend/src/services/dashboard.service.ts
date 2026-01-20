import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Assuming we reuse the token logic or interceptor from other services
// But for simplicity, let's assume a token is stored or handled by an interceptor in a real app.
// Since the 'auth' setup in this codebase is a bit implicit (OIDC), let's see how analytics.service.ts does it.
// Wait, the previous `analytics.service.ts` (Frontend) didn't have specific token logic in the snippet I saw?
// Ah, `frontend/src/services/billing.service.ts` used `fetch` with headers manually if I recall?
// Let's check `frontend/src/services/analytics.service.ts` to copy the pattern.

export interface DashboardStats {
    totalMentions: number;
    activePlatforms: number;
    averageSentiment: number;
    mentionsLast24h: number;
}

export const fetchDashboardStats = async (token: string): Promise<DashboardStats> => {
    const response = await axios.get(`${API_URL}/analytics/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
