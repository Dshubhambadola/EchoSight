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

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await AnalyticsService.generateSummary(auth.user, startDate, endDate);
            setSummary(result);
        } catch (err) {
            setError("Failed to generate summary. Please try again.");
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
                <div className="p-4 bg-red-900/20 border border-red-900 text-red-400 rounded-md">
                    {error}
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
