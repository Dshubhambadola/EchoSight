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
import { AiSummaryWidget } from '../components/Analytics/AiSummaryWidget';
import { TopSoundsWidget } from '../components/Analytics/TopSoundsWidget';
import { ShareOfVoiceWidget } from '../components/Analytics/ShareOfVoiceWidget';
import { useSearch } from '../context/SearchContext';

import { ShinyText } from '../components/bits/ShinyText';
import { SpotlightCard } from '../components/bits/SpotlightCard';

export const Dashboard: React.FC = () => {
    // ... (hooks remain same)
    const auth = useAuth();
    const { query } = useSearch();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [keywords, setKeywords] = useState<{ text: string; value: number }[]>([]);
    const [authors, setAuthors] = useState<{ name: string; count: number; reach: number; impact: number }[]>([]);
    const [sounds, setSounds] = useState<{ name: string; count: number }[]>([]);
    const [sovData, setSovData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>(RANGES[1]); // Default to 7d
    const [keywordType, setKeywordType] = useState<string>('ALL');

    // ... (effects remain same)
    // Share of Voice Logic
    useEffect(() => {
        if (!auth.user?.access_token || !query) {
            setSovData([]);
            return;
        }

        if (query.toLowerCase().includes(' vs ')) {
            const terms = query.split(/\s+vs\s+/i).map(t => t.trim()).filter(t => t.length > 0);
            if (terms.length > 1) {
                AnalyticsService.getShareOfVoice(auth.user, terms, dateRange.startDate, dateRange.endDate)
                    .then(data => setSovData(data))
                    .catch(console.error);
            }
        } else {
            setSovData([]);
        }
    }, [auth.user?.access_token, query, dateRange]);

    useEffect(() => {
        if (auth.user?.access_token) {
            setLoading(true);
            Promise.all([
                fetchDashboardStats(auth.user.access_token, dateRange.startDate, dateRange.endDate),
                AnalyticsService.getKeywords(auth.user, dateRange.startDate, dateRange.endDate, keywordType),
                AnalyticsService.getAuthors(auth.user, dateRange.startDate, dateRange.endDate),
                AnalyticsService.getSounds(auth.user, dateRange.startDate, dateRange.endDate)
            ])
                .then(([statsData, keywordsData, authorsData, soundsData]) => {
                    setStats(statsData);
                    setKeywords(keywordsData);
                    setAuthors(authorsData);
                    setSounds(soundsData);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [auth.user?.access_token, dateRange, keywordType]);

    if (loading && !stats) {
        return <div className="flex h-full items-center justify-center p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight">
                    <ShinyText text="Dashboard Overview" disabled={false} speed={3} className="text-3xl font-extrabold" />
                </h1>
                <DateRangeSelect value={dateRange.key} onChange={setDateRange} />
            </div>

            {/* Share of Voice Widget (Conditional) */}
            {sovData.length > 0 && (
                <div className="mb-6">
                    <ShareOfVoiceWidget data={sovData} />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SpotlightCard>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-slate-500">Total Mentions</h3>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.totalMentions.toLocaleString()}</p>
                    </div>
                </SpotlightCard>
                <SpotlightCard>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-slate-500">Active Platforms</h3>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.activePlatforms}</p>
                    </div>
                </SpotlightCard>
                <SpotlightCard>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-slate-500">Avg Sentiment</h3>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.averageSentiment}</p>
                    </div>
                </SpotlightCard>
                <SpotlightCard>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-slate-500">Mentions (24h)</h3>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.mentionsLast24h.toLocaleString()}</p>
                    </div>
                </SpotlightCard>
            </div>

            {/* AI Summary */}
            <AiSummaryWidget dateRange={dateRange.key} startDate={dateRange.startDate} endDate={dateRange.endDate} />

            {/* Widgets Row 1: Word Cloud & Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WordCloudWidget
                        words={keywords}
                        currentFilter={keywordType}
                        onFilterChange={setKeywordType}
                    />
                </div>
                <div>
                    <TrendingTopicsWidget topics={keywords} />
                </div>
            </div>

            {/* Widgets Row 2: Influencers & Sounds (New) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TopAuthorsWidget authors={authors} />
                </div>
                <div>
                    <TopSoundsWidget sounds={sounds} />
                </div>
            </div>
        </div>
    );
};

