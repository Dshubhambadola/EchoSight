import React from 'react';

interface Author {
    name: string;
    count: number;
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

    return (
        <div className="h-96 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Influencers</h3>
            <div className="space-y-4">
                {topAuthors.map((author, index) => (
                    <div key={author.name} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                        <div className="flex items-center space-x-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white shadow-sm ${index === 0 ? 'bg-yellow-500' :
                                    index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                                }`}>
                                {index + 1}
                            </div>
                            <span className="font-medium text-gray-700 truncate max-w-[120px]" title={author.name}>
                                {author.name}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">{author.count}</span>
                            <span className="text-xs text-gray-500">posts</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
