'use client'

import { ChartData } from '@/dtos/data-visualisation/ChartData'
import { ChartOrientation } from '@/enums/ChartOrientation'
import { ChartUnit } from '@/enums/ChartUnit'
import { useRolledChartData } from '@/hooks/data-visualisation/useRolledChartData'
import { cn } from '@/utils/tailwindUtils'
import { DataVisualisationSvg } from './DataVisualisationSvg'
import { Dimensions, EdgeRect } from '@/dtos/Rect'
import { useMemo, useState } from 'react'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import * as d3 from 'd3'

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
    padding: EdgeRect,
    secondaryAxisThickness: number,
    primaryAxisThickness: number,
    chartMap: d3.InternMap<any, ChartValue>,
    keys: Array<any>,
    valuesScale: d3.ScaleLinear<number, number, never>,
}

type SecondaryAxisParams = {
    padding: EdgeRect,
    valuesScale: d3.ScaleLinear<number, number, never>,
    dimensions: Dimensions,
    primaryAxisThickness: number,
    secondaryAxisThickness: number,
}

export default function LineChart({ data, className, secondaryAxisThickness }: LineChartParams) {
    secondaryAxisThickness ??= 40;
    const primaryAxisThickness = 40;
    const padding: EdgeRect = { left: 10, top: 10, right: 10, bottom: 10 }
    const { chartMap, keys, valuesScale } = useRolledChartData(data, ChartUnit.Count, ChartOrientation.Horizontal);
    const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    return (
        <div
            className={className}>
            <DataVisualisationSvg
                onDimensionsChange={(width, height) => setDimensions({ width, height })}>
                <SecondaryAxis
                    dimensions={dimensions}
                    padding={padding}
                    valuesScale={valuesScale}
                    secondaryAxisThickness={secondaryAxisThickness}
                    primaryAxisThickness={primaryAxisThickness} />
                <Chart
                    chartMap={chartMap}
                    keys={keys}
                    dimensions={dimensions}
                    padding={padding}
                    secondaryAxisThickness={secondaryAxisThickness}
                    primaryAxisThickness={primaryAxisThickness}
                    valuesScale={valuesScale} />
            </DataVisualisationSvg>
        </div>
    )
}

function Chart({ chartMap, keys, valuesScale, dimensions, padding, primaryAxisThickness, secondaryAxisThickness }: ChartParams) {
    const primaryAxisLength = dimensions.width - padding.left - padding.right - secondaryAxisThickness;
    const secondaryAxisLength = dimensions.height - padding.top - padding.bottom - primaryAxisThickness;
    const primaryScale = useMemo(() =>
        d3.scaleBand([0, 1]).domain(keys),
        [keys]);
    const points = useMemo(() => {
        return keys.map((key, index) => {
            const value = chartMap.get(key)?.value || 0;
            const x = padding.left + secondaryAxisThickness + ((primaryScale(key) || 0) * primaryAxisLength);
            const y = padding.top + secondaryAxisLength - Math.max(0, secondaryAxisLength * valuesScale(value));

            return { x, y, key };
        })
    }, [chartMap, keys, padding, secondaryAxisLength, primaryAxisLength]);
    const ticks = useBandTicks(keys, primaryAxisLength);

    return (
        <>
            <polyline
                points={points.map((point) => `${point.x} ${point.y}`).join(', ')}
                fill='none'
                strokeWidth={1.5}
                className='stroke-on-surface-container' />

            {dimensions.width !== 0 && dimensions.height !== 0 && points.map((point, index) => {
                return (
                    <g
                        key={point.key || 'undefined'}>
                        <line
                            x1={point.x} y1={dimensions.height - padding.bottom - primaryAxisThickness}
                            x2={point.x} y2={point.y}
                            strokeDasharray='0 6 6'
                            className='stroke-outline stroke-1' />
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={4}
                            className='fill-primary' />
                    </g>
                )
            })}

            {dimensions.width !== 0 && dimensions.height !== 0 && ticks.map((tick) => {
                const x = padding.left + tick.offset + secondaryAxisThickness;
                const y = dimensions.height - padding.bottom - (primaryAxisThickness / 2);

                return (
                    <text
                        key={tick.key}
                        x={x}
                        y={y}
                        dominantBaseline='middle'
                        textAnchor='middle'
                        className='text-xs fill-on-surface-container'>
                        {tick.displayedValue}
                    </text>
                )
            })}
        </>
    )
}

function SecondaryAxis({ valuesScale, dimensions, padding, primaryAxisThickness, secondaryAxisThickness }: SecondaryAxisParams) {
    const length = dimensions.height - padding.top - padding.bottom - primaryAxisThickness;
    const ticks = useValuesTicks(valuesScale, length);

    return (
        <>
            {dimensions.width !== 0 && dimensions.height !== 0 && ticks.map((tick, index) => {
                const x = padding.left + (secondaryAxisThickness / 2);
                const y = dimensions.height - padding.bottom - primaryAxisThickness + tick.offset;
                const x1 = secondaryAxisThickness + padding.left;
                const x2 = x1 + dimensions.width;

                return (
                    <g
                        key={tick.value}>
                        <line
                            x1={x1} y1={y}
                            x2={x2} y2={y}
                            strokeDasharray='0 6 6'
                            className='stroke-outline stroke-1' />
                        <text
                            x={x}
                            y={y}
                            dominantBaseline='middle'
                            textAnchor='middle'
                            className='text-xs fill-on-surface-container'>
                            {tick.displayedValue}
                        </text>
                    </g>
                )
            })}
        </>
    )
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
        return scale.ticks(numberOfTicksTarget)
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