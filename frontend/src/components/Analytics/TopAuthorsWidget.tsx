import React from 'react';

interface Author {
    name: string;
    count: number;
    reach: number;
    impact: number;
}

interface TopAuthorsWidgetProps {
    authors: Author[];
}

export const TopAuthorsWidget: React.FC<TopAuthorsWidgetProps> = ({ authors }) => {
    // Take top 5
    const topAuthors = authors.slice(0, 5);

    if (!topAuthors || topAuthors.length === 0) {
        return (
            <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-gray-500">No author data available</p>
            </div>
        );
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="h-96 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm overflow-hidden flex flex-col">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Influencers (by Impact)</h3>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2">Rank</th>
                            <th className="px-3 py-2">Author</th>
                            <th className="px-3 py-2 text-right">Reach</th>
                            <th className="px-3 py-2 text-right">Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topAuthors.map((author, index) => (
                            <tr key={author.name} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="px-3 py-3 font-medium text-gray-900 w-12">#{index + 1}</td>
                                <td className="px-3 py-3 font-medium text-gray-700 max-w-[120px] truncate" title={author.name}>
                                    {author.name}
                                </td>
                                <td className="px-3 py-3 text-right text-gray-600">
                                    {formatNumber(author.reach)}
                                </td>
                                <td className="px-3 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${author.impact}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 w-6">{Math.round(author.impact)}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
