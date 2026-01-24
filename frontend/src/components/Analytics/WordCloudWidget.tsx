import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface WordCloudWidgetProps {
    words: { text: string; value: number }[];
    onFilterChange: (type: string) => void;
    currentFilter: string;
}

export const WordCloudWidget: React.FC<WordCloudWidgetProps> = ({ words, onFilterChange, currentFilter }) => {
    const filters = [
        { label: 'All', value: 'ALL' },
        { label: 'People', value: 'PERSON' },
        { label: 'Companies', value: 'ORG' },
        { label: 'Locations', value: 'GPE' },
    ];
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!words || words.length === 0 || !svgRef.current) return;

        // Clear previous render
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        // Scale font size based on value
        const maxVal = Math.max(...words.map(w => w.value));
        const minVal = Math.min(...words.map(w => w.value));
        const fontScale = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([16, 60]);

        const layout = cloud()
            .size([width, height])
            .words(words.map(d => ({ text: d.text, size: fontScale(d.value) })))
            .padding(5)
            .rotate(() => (~~(Math.random() * 2) * 90))
            .font("sans-serif")
            .fontSize((d: any) => d.size)
            .on("end", draw);

        layout.start();

        function draw(words: any[]) {
            svg
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", (d: any) => d.size + "px")
                .style("font-family", "sans-serif")
                .style("fill", "#1e293b") // slate-800
                .attr("text-anchor", "middle")
                .attr("transform", (d: any) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text((d: any) => d.text);
        }

    }, [words]);

    return (
        <div className="h-96 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Topic Cloud</h3>
                <div className="flex space-x-2">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => onFilterChange(f.value)}
                            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${currentFilter === f.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {(!words || words.length === 0) ? (
                <div className="flex h-80 items-center justify-center">
                    <p className="text-gray-500">No data available for Word Cloud</p>
                </div>
            ) : (
                <div className="h-80 w-full">
                    <svg ref={svgRef} className="h-full w-full" />
                </div>
            )}
        </div>
    );
};

