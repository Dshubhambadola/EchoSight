import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { useAuth } from 'react-oidc-context';
import { AnalyticsService } from '../services/analytics.service';

const COLORS = ['#0ea5e9', '#ec4899', '#f97316', '#22c55e'];

export const Analytics = () => {
    const auth = useAuth();
    const [trends, setTrends] = useState<any[]>([]);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (auth.user) {
                // Simple mock gating: if data is empty or fetch fails, we treat as locked/no-pro
                try {
                    const [trendsData, distData] = await Promise.all([
                        AnalyticsService.getTrends(auth.user),
                        AnalyticsService.getDistribution(auth.user),
                    ]);
                    setTrends(trendsData);
                    setDistribution(distData);
                } catch (error) {
                    console.error('Error fetching analytics:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchData();
    }, [auth.user]);

    if (loading) {
        return <div className="text-white animate-pulse">Loading Analytics...</div>;
    }

    // Gating Logic: If no data loaded (mocking "Pro" restriction or empty state), show lock
    // In a real app, we would check a user role or 403 status specifically.
    if (trends.length === 0 && distribution.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl text-white font-bold mb-4">Analytics Locked</h2>
                <p className="text-slate-400 mb-8">Upgrade to Pro to view historical insights.</p>
                <a href="/upgrade" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all">
                    Verify / Upgrade Plan
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold text-white">Analytics Overview</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Trend Chart */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-lg font-medium text-slate-300 mb-4">
                        Sentiment Trends (Last 7 Days)
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="average_sentiment"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#0ea5e9' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Distribution Chart */}
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-lg font-medium text-slate-300 mb-4">
                        Platform Share
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="platform"
                                >
                                    {distribution.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
