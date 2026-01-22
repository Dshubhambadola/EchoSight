import React from 'react';

interface TrendingTopicsWidgetProps {
    topics: { text: string; value: number }[];
}

export const TrendingTopicsWidget: React.FC<TrendingTopicsWidgetProps> = ({ topics }) => {
    // Take top 5
    const topTopics = topics.slice(0, 5);

    if (!topTopics || topTopics.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-gray-500">No trending topics found</p>
            </div>
        );
    }

    return (
        <div className="h-96 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Trending Topics</h3>
            <div className="space-y-3">
                {topTopics.map((topic, index) => (
                    <div key={topic.text} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                        <div className="flex items-center space-x-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                {index + 1}
                            </span>
                            <span className="font-medium text-gray-700 capitalize">{topic.text}</span>
                        </div>
                        <span className="text-sm text-gray-500">{topic.value} mentions</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
