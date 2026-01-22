import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchDashboardStats } from '../services/dashboard.service';
import type { DashboardStats } from '../services/dashboard.service';
import { AnalyticsService } from '../services/analytics.service';
import { WordCloudWidget } from '../components/Analytics/WordCloudWidget';
import { TrendingTopicsWidget } from '../components/Analytics/TrendingTopicsWidget';
import { DateRangeSelect, RANGES } from '../components/Analytics/DateRangeSelect';
import type { DateRange } from '../components/Analytics/DateRangeSelect';
import { TopAuthorsWidget } from '../components/Analytics/TopAuthorsWidget';

export const Dashboard: React.FC = () => {
    const auth = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [keywords, setKeywords] = useState<{ text: string; value: number }[]>([]);
    const [authors, setAuthors] = useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>(RANGES[1]); // Default to 7d

    useEffect(() => {
        if (auth.user?.access_token) {
            setLoading(true);
            Promise.all([
                fetchDashboardStats(auth.user.access_token, dateRange.startDate, dateRange.endDate),
                AnalyticsService.getKeywords(auth.user, dateRange.startDate, dateRange.endDate),
                AnalyticsService.getAuthors(auth.user, dateRange.startDate, dateRange.endDate)
            ])
                .then(([statsData, keywordsData, authorsData]) => {
                    setStats(statsData);
                    setKeywords(keywordsData);
                    setAuthors(authorsData);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [auth.user?.access_token, dateRange]);

    if (loading && !stats) {
        return <div className="flex h-full items-center justify-center p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <DateRangeSelect value={dateRange.key} onChange={setDateRange} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-400">Total Mentions</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{stats?.totalMentions.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-400">Active Platforms</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{stats?.activePlatforms}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-400">Avg Sentiment</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{stats?.averageSentiment}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-400">Mentions (24h)</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{stats?.mentionsLast24h.toLocaleString()}</p>
                </div>
            </div>

            {/* Widgets Row 1: Word Cloud & Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WordCloudWidget words={keywords} />
                </div>
                <div>
                    <TrendingTopicsWidget topics={keywords} />
                </div>
            </div>

            {/* Widgets Row 2: Influencers (New) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <TopAuthorsWidget authors={authors} />
                </div>
                {/* Future widgets can go here */}
            </div>
        </div>
    );
};

