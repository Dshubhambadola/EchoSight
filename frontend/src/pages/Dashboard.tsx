import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchDashboardStats } from '../services/dashboard.service';
import type { DashboardStats } from '../services/dashboard.service';

export const Dashboard = () => {
    const auth = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.user?.access_token) {
            fetchDashboardStats(auth.user.access_token)
                .then(setStats)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [auth.user?.access_token]);

    if (loading) {
        return <div className="text-white">Loading dashboard...</div>;
    }

    const metrics = [
        { label: 'Total Mentions', value: stats?.totalMentions.toLocaleString() || '0' },
        { label: 'Active Platforms', value: stats?.activePlatforms.toLocaleString() || '0' },
        { label: 'Avg Sentiment', value: stats?.averageSentiment || '0.00' },
        { label: 'Mentions (24h)', value: stats?.mentionsLast24h.toLocaleString() || '0' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                        <h3 className="text-slate-400 text-sm font-medium">{m.label}</h3>
                        <p className="text-2xl font-bold text-white mt-2">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h2 className="text-xl font-semibold text-white mb-4">Live Social Activity</h2>
                <p className="text-slate-400">
                    Head over to the <span className="text-electric-teal font-medium">Live Feed</span> tab to see the latest posts streaming in from Reddit (r/technology).
                </p>
            </div>
        </div>
    );
};
