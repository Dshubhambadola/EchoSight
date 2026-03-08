import { useState } from 'react';
import { AnalyticsService } from '../../services/analytics.service';
import { useAuth } from 'react-oidc-context';

interface AiSummaryWidgetProps {
    dateRange: string;
    startDate?: Date | null;
    endDate?: Date | null;
}

export function AiSummaryWidget({ startDate, endDate }: AiSummaryWidgetProps) {
    const auth = useAuth();
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [upgradeRequired, setUpgradeRequired] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setUpgradeRequired(false);
        try {
            const result = await AnalyticsService.generateSummary(auth.user, startDate, endDate);
            setSummary(result);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setUpgradeRequired(true);
            } else {
                setError("Failed to generate summary. Please try again.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    ✨ AI Insights
                </h2>
                {!summary && !loading && (
                    <button
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
                    >
                        Generate Summary
                    </button>
                )}
            </div>

            {loading && (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900 text-red-400 rounded-md mb-4">
                    {error}
                </div>
            )}

            {upgradeRequired && (
                <div className="p-6 bg-indigo-900/20 border border-indigo-500/50 rounded-md text-center">
                    <h3 className="text-lg font-medium text-white mb-2">Pro Feature</h3>
                    <p className="text-slate-400 mb-4">You need an active EchoSight Pro subscription to use AI Summarization.</p>
                    <a
                        href="/upgrade"
                        className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md transition-colors"
                    >
                        Upgrade Now
                    </a>
                </div>
            )}

            {summary && (
                <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {summary}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleGenerate}
                            className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                            Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
