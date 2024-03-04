'use client'

import { ChartData } from '@/dtos/data-visualisation/ChartData'
import { ChartOrientation } from '@/enums/ChartOrientation'
import { ChartUnit } from '@/enums/ChartUnit'
import { useRolledChartData } from '@/hooks/data-visualisation/useRolledChartData'
import { DataVisualisationSvg } from './DataVisualisationSvg'
import { Dimensions, EdgeRect } from '@/dtos/Rect'
import { PointerEvent, useCallback, useMemo, useRef, useState } from 'react'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import * as d3 from 'd3'
import { cn } from '@/utils/tailwindUtils'
import { clamp } from '@/utils/numbers'
import OutlinedText from './OutlinedText'

export type LineChartData<T> = {
    pointTitle?: (key: any) => string,
} & ChartData<T>

type LineChartParams = {
    data: LineChartData<any>,
    secondaryAxisThickness?: number,
    className?: string,
}

type ChartParams = {
    dimensions: Dimensions,
    chartPadding: EdgeRect,
    secondaryAxisThickness: number,
    primaryAxisThickness: number,
    chartMap: d3.InternMap<any, ChartValue>,
    keys: Array<any>,
    valuesScale: d3.ScaleLinear<number, number, never>,
    primaryScale: d3.ScaleBand<string>,
    primaryAxisLength: number,
    secondaryAxisLength: number,
    hoveredKey: any | null
}

type SecondaryAxisParams = {
    chartPadding: EdgeRect,
    valuesScale: d3.ScaleLinear<number, number, never>,
    dimensions: Dimensions,
    primaryAxisThickness: number,
    secondaryAxisThickness: number,
}

export default function LineChart({ data, className, secondaryAxisThickness }: LineChartParams) {
    secondaryAxisThickness ??= 40;
    const primaryAxisThickness = 40;
    // Padding of the chart, axes excluded
    const chartPadding: EdgeRect = { left: 20, top: 10, right: 10, bottom: 20 }
    const { chartMap, keys, valuesScale } = useRolledChartData(data, ChartUnit.Count);
    const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const primaryScale = useMemo(() =>
        d3.scaleBand([0, 1]).domain(keys),
        [keys]);
    const primaryAxisLength = dimensions.width - chartPadding.left - chartPadding.right - secondaryAxisThickness;
    const secondaryAxisLength = dimensions.height - chartPadding.top - chartPadding.bottom - primaryAxisThickness;
    const { hoveredKey, onPointerLeave, onPointerMove } = useHoveredKey(keys, primaryScale, primaryAxisLength, secondaryAxisThickness, chartPadding);

    return (
        <div
            className={cn('relative', className)}>
            <DataVisualisationSvg
                onDimensionsChange={(width, height) => setDimensions({ width, height })}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}>
                <SecondaryAxis
                    dimensions={dimensions}
                    chartPadding={chartPadding}
                    valuesScale={valuesScale}
                    secondaryAxisThickness={secondaryAxisThickness}
                    primaryAxisThickness={primaryAxisThickness} />
                <Chart
                    chartMap={chartMap}
                    keys={keys}
                    dimensions={dimensions}
                    chartPadding={chartPadding}
                    secondaryAxisThickness={secondaryAxisThickness}
                    primaryAxisThickness={primaryAxisThickness}
                    valuesScale={valuesScale}
                    primaryScale={primaryScale}
                    primaryAxisLength={primaryAxisLength}
                    secondaryAxisLength={secondaryAxisLength}
                    hoveredKey={hoveredKey} />
            </DataVisualisationSvg>
        </div>
    )
}

function Chart({ chartMap, keys, valuesScale, dimensions, chartPadding, primaryAxisThickness, secondaryAxisThickness, primaryScale, primaryAxisLength, secondaryAxisLength, hoveredKey }: ChartParams) {
    const points = useMemo(() => {
        return keys.map((key, index) => {
            const value = chartMap.get(key)?.value || 0;
            const x = chartPadding.left + secondaryAxisThickness + ((primaryScale(key) || 0) * primaryAxisLength);
            const y = chartPadding.top + secondaryAxisLength - Math.max(0, secondaryAxisLength * valuesScale(value));

            return { x, y, key, value };
        });
    }, [chartMap, keys, chartPadding, secondaryAxisLength, primaryAxisLength, secondaryAxisThickness, valuesScale, primaryScale]);
    const ticks = useBandTicks(keys, primaryAxisLength);

    return (
        <>
            <polyline
                points={points.map((point) => `${point.x} ${point.y}`).join(', ')}
                fill='none'
                strokeWidth={1.5}
                className='stroke-on-surface-container pointer-events-none' />

            {dimensions.width !== 0 && dimensions.height !== 0 && points.map((point, index) => {
                return (
                    <g
                        className='pointer-events-none'
                        key={point.key || 'undefined'}>
                        <line
                            x1={point.x} y1={dimensions.height - primaryAxisThickness}
                            x2={point.x} y2={point.y}
                            strokeDasharray='0 6 6'
                            className={cn(
                                'stroke-outline pointer-events-none stroke-1',
                                !hoveredKey || hoveredKey === point.key ? '' : 'opacity-40')} />
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredKey === point.key ? 6 : 4}
                            className='fill-primary pointer-events-none' />

                        {
                            hoveredKey === point.key &&
                            <OutlinedText
                                x={point.x}
                                y={point.y + ((point.y - chartPadding.top) > 16 ? -16 : 18)}
                                dominantBaseline='middle'
                                textAnchor='middle'
                                className='text-sm'>
                                {point.value}
                            </OutlinedText>
                        }
                    </g>
                )
            })}

            {dimensions.width !== 0 && dimensions.height !== 0 && ticks.map((tick) => {
                const x = chartPadding.left + tick.offset + secondaryAxisThickness;
                const y = dimensions.height - (primaryAxisThickness / 2);

                return (
                    <text
                        key={tick.key}
                        x={x}
                        y={y}
                        dominantBaseline='middle'
                        textAnchor='middle'
                        className='text-xs fill-on-surface-container pointer-events-none'>
                        {tick.displayedValue}
                    </text>
                )
            })}
        </>
    )
}

function SecondaryAxis({ valuesScale, dimensions, chartPadding, primaryAxisThickness, secondaryAxisThickness }: SecondaryAxisParams) {
    const length = dimensions.height - chartPadding.top - chartPadding.bottom - primaryAxisThickness;
    const ticks = useValuesTicks(valuesScale, length);

    return (
        <>
            {dimensions.width !== 0 && dimensions.height !== 0 && ticks.map((tick, index) => {
                const x = (secondaryAxisThickness / 2);
                const y = dimensions.height - chartPadding.bottom - primaryAxisThickness + tick.offset;
                const x1 = secondaryAxisThickness;
                const x2 = x1 + dimensions.width;

                return (
                    <g
                        key={tick.value}
                        className='pointer-events-none'>
                        <line
                            x1={x1} y1={y}
                            x2={x2} y2={y}
                            strokeDasharray='0 6 6'
                            className='stroke-outline stroke-1 pointer-events-none' />
                        <text
                            x={x}
                            y={y}
                            dominantBaseline='middle'
                            textAnchor='middle'
                            className='text-xs fill-on-surface-container pointer-events-none'>
                            {tick.displayedValue}
                        </text>
                    </g>
                )
            })}
        </>
    )
}

/** Hook that returns currently hovered key. */
function useHoveredKey(keys: Array<any>, primaryScale: d3.ScaleBand<string>, primaryAxisLength: number, secondaryAxisThickness: number, chartPadding: EdgeRect) {
    const [hoveredKey, setHoveredKey] = useState<any | null>(null);

    const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
        const rect = (e.target as Element).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const left = primaryAxisLength * (primaryScale(keys[0]) || 0);
        const right = primaryAxisLength * (primaryScale(keys[keys.length - 1]) || 0);
        const length = right - left;
        const cursor = mouseX - (chartPadding.left + secondaryAxisThickness! + left);
        const relativePosition = cursor / length;
        const index = Math.round((keys.length - 1) * relativePosition);

        if (index < 0 || index >= keys.length) {
            setHoveredKey(null);
        }
        else {
            setHoveredKey(keys[clamp(Math.round((keys.length - 1) * relativePosition), 0, keys.length - 1)]);
        }
    }, [keys, primaryScale, primaryAxisLength, secondaryAxisThickness, chartPadding, setHoveredKey]);

    const onPointerLeave = useCallback((e: PointerEvent<HTMLDivElement>) => {
        setHoveredKey(null);
    }, [setHoveredKey]);

    return {
        hoveredKey,
        onPointerMove,
        onPointerLeave
    };
}

/** Hook that returns a scale for ticks that can be displayed on the secondary axis. */
function useValuesTicks(
    scale: d3.ScaleLinear<number, number, never>,
    axisLength: number
) {
    return useMemo(() => {
        const pixelsPerTick = 60;
        const numberOfTicksTarget = Math.max(1, Math.floor(axisLength / pixelsPerTick));

        return scale.ticks(numberOfTicksTarget)
            .filter((value) => value % 1 === 0)
            .map((value) => ({
                value,
                displayedValue: value,
                offset: 1 - scale(value) * axisLength
            }));
    }, [scale, axisLength]);
}

function useBandTicks(keys: Array<any>, axisLength: number) {
    const pixelsPerTick = 60;
    const numberOfTicksTarget = Math.max(1, Math.floor(axisLength / pixelsPerTick));

    const ticks = useMemo(() => {
        const scale = d3.scaleLinear([0, keys.length - 1], [0, keys.length - 1]);
        return scale.ticks(Math.min(numberOfTicksTarget, keys.length - 1))
            .map((value) => {
                const s = scale(value);
                const key = keys[Math.round(s)];

                return {
                    key,
                    displayedValue: key,
                    offset: (s / keys.length) * axisLength
                }
            });
    }, [numberOfTicksTarget, keys, axisLength]);

    return ticks;
}