import React from 'react';

interface Sound {
    name: string;
    count: number;
}

interface TopSoundsWidgetProps {
    sounds: Sound[];
}

export const TopSoundsWidget: React.FC<TopSoundsWidgetProps> = ({ sounds }) => {
    return (
        <div className="h-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Top Sounds (TikTok)</h3>
            <div className="space-y-3">
                {(!sounds || sounds.length === 0) && (
                    <p className="text-sm text-gray-500">No trending sounds data.</p>
                )}
                {sounds.map((sound, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-700">{sound.name}</span>
                        </div>
                        <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600">
                            {sound.count} uses
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
