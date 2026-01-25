import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { FileText, Download, User as UserIcon, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsService } from '../services/analytics.service';
import { fetchDashboardStats } from '../services/dashboard.service';
import { DateRangeSelect, RANGES } from '../components/Analytics/DateRangeSelect';
import type { DateRange } from '../components/Analytics/DateRangeSelect';

export const Reports: React.FC = () => {
    const auth = useAuth();
    const [dateRange, setDateRange] = useState<DateRange>(RANGES[1]); // 7 days default
    const [loading, setLoading] = useState(false);

    const generateCSV = async () => {
        if (!auth.user?.access_token) return;
        setLoading(true);
        try {
            const data = await AnalyticsService.getRawData(auth.user, dateRange.startDate, dateRange.endDate);
            if (!data || data.length === 0) {
                alert('No data found for this period.');
                return;
            }

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map((row: any) =>
                Object.values(row).map(value => {
                    if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `echosight_raw_data_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error(error);
            alert('Failed to generate CSV');
        } finally {
            setLoading(false);
        }
    };

    const generateExecutivePDF = async () => {
        if (!auth.user?.access_token) return;
        setLoading(true);
        try {
            // Fetch necessary data
            const [stats, keywords, authors] = await Promise.all([
                fetchDashboardStats(auth.user.access_token, dateRange.startDate, dateRange.endDate),
                AnalyticsService.getKeywords(auth.user, dateRange.startDate, dateRange.endDate),
                AnalyticsService.getAuthors(auth.user, dateRange.startDate, dateRange.endDate)
            ]);

            const doc = new jsPDF();

            // Title
            doc.setFontSize(22);
            doc.text('EchoSight Executive Summary', 14, 20);

            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
            doc.text(`Period: ${dateRange.key}`, 14, 33);

            // High Level Stats
            doc.setFontSize(16);
            doc.text('Key Metrics', 14, 45);

            const statsData = [
                ['Total Mentions', stats?.totalMentions.toLocaleString() || '0'],
                ['Active Platforms', stats?.activePlatforms.toString() || '0'],
                ['Avg Sentiment', stats?.averageSentiment || '0'],
                ['Velocity (24h)', stats?.mentionsLast24h.toLocaleString() || '0']
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: statsData,
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] } // Sky 500
            });

            // Top Keywords
            doc.text('Trending Topics', 14, (doc as any).lastAutoTable.finalY + 15);
            const keywordData = keywords.slice(0, 10).map((k: any) => [k.text, k.value]);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Topic', 'Mentions']],
                body: keywordData,
                theme: 'grid'
            });

            // Top Authors
            doc.text('Top Influencers', 14, (doc as any).lastAutoTable.finalY + 15);
            const authorData = authors.slice(0, 10).map((a: any) => [a.name, a.count, a.impact.toFixed(1)]);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Author', 'Mentions', 'Impact Score']],
                body: authorData,
                theme: 'grid'
            });

            doc.save('echosight_executive_summary.pdf');

        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reports & Exports</h1>
                    <p className="text-gray-500 mt-1">Generate insights and export data for offline analysis.</p>
                </div>
                <DateRangeSelect value={dateRange.key} onChange={setDateRange} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Executive Summary Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
                            <p className="text-sm text-gray-500">High-level KPIs and trends.</p>
                        </div>
                    </div>
                    <button
                        onClick={generateExecutivePDF}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Download PDF</span>
                    </button>
                </div>

                {/* Raw Data Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Raw Data Export</h3>
                            <p className="text-sm text-gray-500">Full dataset (CSV) for analysis.</p>
                        </div>
                    </div>
                    <button
                        onClick={generateCSV}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download CSV</span>
                    </button>
                </div>

                {/* Influencer Audit Card (Placeholder for now, or just same as Exec but focused) */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow opacity-70">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Influencer Audit</h3>
                            <p className="text-sm text-gray-500">Detailed influencer breakdown.</p>
                        </div>
                    </div>
                    <button
                        disabled={true}
                        className="w-full flex items-center justify-center space-x-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Coming Soon</span>
                    </button>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-800">Generating Report...</p>
                    </div>
                </div>
            )}
        </div>
    );
};
