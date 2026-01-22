import React from 'react';

export interface DateRange {
    key: string;
    label: string;
    startDate: Date | null;
    endDate: Date | null;
}

interface DateRangeSelectProps {
    value: string;
    onChange: (range: DateRange) => void;
}

export const RANGES: DateRange[] = [
    {
        key: '24h',
        label: 'Last 24 Hours',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
    },
    {
        key: '7d',
        label: 'Last 7 Days',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
    },
    {
        key: '30d',
        label: 'Last 30 Days',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
    },
    {
        key: 'all',
        label: 'All Time',
        startDate: null,
        endDate: null,
    }
];

export const DateRangeSelect: React.FC<DateRangeSelectProps> = ({ value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value;
        const range = RANGES.find(r => r.key === selectedKey);
        if (range) {
            onChange(range);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="date-range" className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
                id="date-range"
                value={value}
                onChange={handleChange}
                className="block w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                {RANGES.map((range) => (
                    <option key={range.key} value={range.key}>
                        {range.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
