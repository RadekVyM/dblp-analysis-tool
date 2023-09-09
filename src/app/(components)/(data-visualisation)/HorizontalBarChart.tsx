'use client'

import { VisualDataContainer } from './VisualDataContainer'
import { useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'

export type HorizontalBarChartData<T> = {
    color: (key: any) => string,
    barTitle?: (key: any) => string,
    bar: (value: T) => any,
    barValue?: (value: T) => any,
    items: Array<T>
}

type HorizontalBarChartParams = {
    data: HorizontalBarChartData<any>,
    padding?: { left: number, top: number, right: number, bottom: number },
    className?: string,
    innerClassName?: string
}

export default function HorizontalBarChart({ data, padding, className, innerClassName }: HorizontalBarChartParams) {
    const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);
    const [rolled, setRolled] = useState<d3.InternMap<any, number>>(new d3.InternMap<any, number>());

    const xLabelHeight = 36;
    const yLabelWidth = 110;
    const horizontalGap = 25;
    const pad = padding || { left: 0, top: 20, right: 1, bottom: 20 + xLabelHeight };
    const chartWidth = (dimensions?.width || 1) - yLabelWidth - horizontalGap - pad.left - pad.right;

    const xDomain = useMemo(() => [0, (d3.extent(rolled.values()) as [number, number])[1]], [rolled])
    const y = useMemo(() =>
        d3.scaleBand([0, (dimensions?.height || 1) - pad.top - pad.bottom]).domain(rolled.keys()),
        [dimensions, rolled]);
    const x = useMemo(() =>
        d3.scaleLinear(xDomain, [0, chartWidth]),
        [dimensions, xDomain]);

    const ticks = useMemo(() => {
        const pixelsPerTick = 80;
        const numberOfTicksTarget = Math.max(1, Math.floor((dimensions?.width || 1) / pixelsPerTick));

        return x.ticks(numberOfTicksTarget)
            .map(value => ({
                value,
                xOffset: x(value)
            }));
    }, [x, dimensions])

    useEffect(() => {
        setRolled(d3.rollup(data.items, r => r.length, data.bar));
    }, [data]);

    return (
        <VisualDataContainer
            className={className}
            innerClassName={innerClassName}
            onDimensionsChange={(width, height) => setDimensions({ width, height })}>
            {
                dimensions &&
                <text
                    x={pad.left + yLabelWidth + horizontalGap + (chartWidth / 2)}
                    y={dimensions.height - 4}
                    textAnchor='middle'
                    className='text-sm'>
                    Publications Count
                </text>
            }

            {
                dimensions && ticks.map((tick, index) => {
                    const left = pad.left + yLabelWidth + horizontalGap + tick.xOffset;
                    const textVerticalOffset = 8;
                    const textAnchor = xDomain[1] == tick.value ? 'end' : 'middle';

                    return (
                        <g>
                            <line
                                x1={left} y1={pad.top}
                                x2={left} y2={dimensions.height - pad.bottom}
                                strokeDasharray='0 6 6'
                                className='stroke-outline-variant stroke-1' />

                            <text
                                x={left}
                                y={pad.top - textVerticalOffset}
                                textAnchor={textAnchor}
                                className='text-xs fill-on-surface-container'>
                                {tick.value}
                            </text>

                            <text
                                x={left}
                                y={dimensions.height - pad.bottom + textVerticalOffset}
                                dominantBaseline='hanging' textAnchor={textAnchor}
                                className='text-xs fill-on-surface-container'>
                                {tick.value}
                            </text>
                        </g>
                    )
                })
            }

            {dimensions && Array.from(rolled.keys()).map((key, index) => {
                const bandWidth = y.bandwidth();
                const barHeight = Math.min(bandWidth, 28);
                const yOffset = (bandWidth - barHeight) / 2;

                const left = pad.left + yLabelWidth + horizontalGap;
                const top = (y(key) || 0) + yOffset + pad.top;
                const width = Math.max(x(rolled.get(key) as number), 2);
                const radius = Math.min(8, barHeight / 2, width / 2);

                return (
                    <g>
                        <foreignObject
                            x={pad.left}
                            y={(y(key) || 0) + pad.top}
                            width={yLabelWidth}
                            height={bandWidth}>
                            <div
                                className='flex items-center justify-end h-full'>
                                <span className='text-xs text-end text-on-surface-container'>{data.barTitle && data.barTitle(key)}</span>
                            </div>
                        </foreignObject>

                        <rect
                            className={data.color(key)}
                            key={key}
                            x={left}
                            y={top}
                            width={width}
                            height={barHeight}
                            rx={radius} ry={radius} />

                        <OutlinedText
                            x={left + (width / 2)}
                            y={top + (barHeight / 2) + 2}
                            dominantBaseline='middle' textAnchor='middle'
                            className='text-xs font-semibold'>
                            {rolled.get(key) as number}
                        </OutlinedText>
                    </g>
                )
            })}
        </VisualDataContainer>
    )
}
