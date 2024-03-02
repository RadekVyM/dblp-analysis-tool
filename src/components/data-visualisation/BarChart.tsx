'use client'

import { DataVisualisationSvg } from './DataVisualisationSvg'
import { useState, useMemo, useRef, forwardRef, CSSProperties } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'
import { cn, prependDashedPrefix } from '@/utils/tailwindUtils'
import useDimensions from '@/hooks/useDimensions'
import { ChartUnit } from '@/enums/ChartUnit'
import { ChartOrientation } from '@/enums/ChartOrientation'
import { useRolledChartData } from '@/hooks/data-visualisation/useRolledChartData'
import { ChartData } from '@/dtos/data-visualisation/ChartData'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import { Dimensions, EdgeRect } from '@/dtos/Rect'
import Link from 'next/link'

export type BarChartData<T> = {
    color: (key: any, value?: ChartValue) => string,
    barTitle?: (key: any, value?: ChartValue) => string,
    barLink?: (key: any, value?: ChartValue) => string,
} & ChartData<T>

type BarChartParams = {
    data: BarChartData<any>,
    selectedUnit: ChartUnit,
    maxBarsCount?: number,
    bandThickness?: number,
    secondaryAxisThickness?: number,
    className?: string,
    orientation?: ChartOrientation,
    onBarClick?: (key: any, value?: ChartValue) => void
}

type SecondaryAxisParams = {
    orientation: ChartOrientation,
    selectedUnit: ChartUnit,
    padding: EdgeRect,
    valuesScale: d3.ScaleLinear<number, number, never>,
    dimensions: Dimensions,
    className?: string,
    style?: CSSProperties,
}

type ChartParams = {
    selectedUnit: ChartUnit,
    dimensions: Dimensions,
    padding: EdgeRect,
    chartMap: d3.InternMap<any, ChartValue>,
    keys: Array<any>,
    valuesScale: d3.ScaleLinear<number, number, never>,
    orientation: ChartOrientation,
    className?: string,
    color: (key: any, value?: ChartValue) => string,
    onBarClick?: (key: any, value?: ChartValue) => void
}

type PrimaryAxisLabelsParams = {
    labels: Array<{ key: any, label: any, link?: string }>,
    orientation: ChartOrientation,
    dimensions: Dimensions,
    padding: EdgeRect,
    secondaryAxisThickness: number,
    className?: string,
}

type SecondaryAxisLinesParams = {
} & SecondaryAxisParams

/** Chart that displays data as bars. */
export default function BarChart({ data, className, bandThickness, secondaryAxisThickness, orientation, selectedUnit, maxBarsCount, onBarClick }: BarChartParams) {
    orientation ??= ChartOrientation.Horizontal;
    bandThickness ??= 75;
    secondaryAxisThickness ??= 40;
    const chartPadding: EdgeRect = useMemo(() =>
        orientation == ChartOrientation.Horizontal ?
            { left: 40, top: 0, right: 40, bottom: 0 } :
            { left: 0, top: 10, right: 0, bottom: 10 }, [orientation]);
    const { chartMap, keys, valuesScale } = useRolledChartData(data, selectedUnit, orientation, maxBarsCount);
    const {
        svgContainerRef,
        dimensions
    } = useChartDimensions(keys.length, bandThickness, orientation);

    return (
        <div
            className={cn(
                className,
                'overflow-auto',
                'grid thin-scrollbar scroll-gutter-stable box-border min-h-0 min-w-0',
                orientation === ChartOrientation.Horizontal ?
                    'grid-cols-[minmax(8rem,0.25fr)_1fr]' :
                    'grid-rows-[1fr_minmax(2rem,auto)]'
            )}>
            <PrimaryAxisLabels
                orientation={orientation || ChartOrientation.Horizontal}
                labels={keys.map((key) => {
                    let label = key;
                    let link = undefined;
                    if (data.barTitle) {
                        const value = chartMap.get(key);
                        label = data.barTitle(key, value);
                    }
                    if (data.barLink) {
                        const value = chartMap.get(key);
                        link = data.barLink(key, value);
                    }
                    return { key, label, link };
                })}
                dimensions={dimensions}
                padding={chartPadding}
                secondaryAxisThickness={secondaryAxisThickness}
                className={cn(
                    'm-auto',
                    orientation === ChartOrientation.Horizontal ?
                        'order-1' :
                        'order-2'
                )} />
            <div
                ref={svgContainerRef}
                className={cn(
                    'relative isolate',
                    'w-full h-full min-h-0 min-w-0 grid place-items-center',
                    orientation === ChartOrientation.Horizontal ?
                        'order-2 grid-rows-[1fr_auto] grid-cols-1' :
                        'order-1 grid-cols-[auto_1fr] grid-rows-1'
                )}>
                <Chart
                    className='z-10'
                    padding={chartPadding}
                    dimensions={dimensions}
                    color={data.color}
                    orientation={orientation}
                    chartMap={chartMap}
                    keys={keys}
                    selectedUnit={selectedUnit}
                    valuesScale={valuesScale}
                    onBarClick={onBarClick} />

                <SecondaryAxis
                    orientation={orientation}
                    padding={chartPadding}
                    dimensions={dimensions}
                    selectedUnit={selectedUnit}
                    valuesScale={valuesScale}
                    style={{
                        width: orientation === ChartOrientation.Horizontal ? undefined : secondaryAxisThickness,
                        height: orientation === ChartOrientation.Horizontal ? secondaryAxisThickness : undefined,
                    }}
                    className={cn(
                        'sticky bg-surface-container z-20',
                        orientation === ChartOrientation.Horizontal ?
                            'bottom-0 left-0 right-0 col-start-1 row-start-2 self-end justify-self-stretch' :
                            'top-0 bottom-0 left-0 col-start-1 row-start-1 self-stretch justify-self-start'
                    )} />

                <SecondaryAxisLines
                    orientation={orientation}
                    padding={chartPadding}
                    dimensions={dimensions}
                    selectedUnit={selectedUnit}
                    valuesScale={valuesScale}
                    className='absolute inset-0'
                    style={{
                        width: `max(calc(100% - ${secondaryAxisThickness}px),${dimensions.width}px)`,
                        height: `max(calc(100% - ${secondaryAxisThickness}px),${dimensions.height}px)`,
                        left: orientation === ChartOrientation.Horizontal ? undefined : secondaryAxisThickness,
                        bottom: orientation === ChartOrientation.Horizontal ? secondaryAxisThickness : undefined,
                    }} />
            </div>
        </div>
    )
}

function Chart({ chartMap, keys, valuesScale, dimensions, selectedUnit, orientation, padding, className, color, onBarClick }: ChartParams) {
    const secondaryAxisLength = orientation === ChartOrientation.Horizontal ?
        dimensions.width - padding.left - padding.right :
        dimensions.height - padding.top - padding.bottom;
    const primaryAxisLength = orientation === ChartOrientation.Horizontal ?
        dimensions.height - padding.top - padding.bottom :
        dimensions.width - padding.left - padding.right;
    const barsScale = useMemo(() =>
        d3.scaleBand([0, primaryAxisLength]).domain(keys),
        [keys, primaryAxisLength]);

    return (
        <svg
            width={dimensions.width}
            height={dimensions.height}
            style={{
                width: orientation === ChartOrientation.Horizontal ? undefined : dimensions.width,
                height: orientation === ChartOrientation.Horizontal ? dimensions.height : undefined
            }}
            className={cn(className, 'w-full h-full relative')}>
            {dimensions.width !== 0 && dimensions.height !== 0 && keys.map((key, index) => {
                const chartValue = chartMap.get(key);
                const value = chartValue?.value || 0;
                const displayedValue = selectedUnit === ChartUnit.Percentage ?
                    value.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 }) :
                    value.toLocaleString(undefined, { maximumFractionDigits: 2 });
                const bandWidth = barsScale.bandwidth();
                const barHeight = Math.min(bandWidth, 28);
                const offset = (barsScale(key) || 0) + (bandWidth - barHeight) / 2;
                const length = Math.max(0, secondaryAxisLength * valuesScale(value));

                const left = padding.left + (orientation === ChartOrientation.Horizontal ? 0 : offset);
                const top = padding.top + (orientation === ChartOrientation.Horizontal ? offset : secondaryAxisLength - length);
                const width = orientation === ChartOrientation.Horizontal ? length : barHeight;
                const height = orientation === ChartOrientation.Horizontal ? barHeight : length;
                const radius = Math.min(8, barHeight / 2, width / 2);

                return (
                    <g
                        key={key === undefined ? 'undefined' : key}>
                        <rect
                            className={cn(
                                prependDashedPrefix('fill', color(key, chartValue)),
                                onBarClick && 'cursor-pointer hover:brightness-95')}
                            x={left} y={top}
                            width={width} height={height}
                            rx={radius} ry={radius}
                            onClick={onBarClick && (() => onBarClick(key, chartValue))} />

                        <OutlinedText
                            x={left + (width / 2)} y={top + (height / 2) + 2}
                            dominantBaseline='middle' textAnchor='middle'
                            className='text-xs font-semibold pointer-events-none'>
                            {displayedValue}
                        </OutlinedText>
                    </g>
                )
            })}
        </svg>
    )
}

function SecondaryAxis({ valuesScale, dimensions, selectedUnit, padding, orientation, className, style }: SecondaryAxisParams) {
    const [svgDimensions, setSvgDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const ticks = useValuesTicks(valuesScale, orientation, dimensions, padding, selectedUnit);

    return (
        <DataVisualisationSvg
            className={className}
            style={style}
            onDimensionsChange={(width, height) => setSvgDimensions({ width, height })}>
            {dimensions.width !== 0 && dimensions.height !== 0 && ticks.map((tick, index) => {
                const x = orientation === ChartOrientation.Horizontal ?
                    padding.left + tick.offset :
                    padding.left + (svgDimensions.width / 2);
                const y = orientation === ChartOrientation.Horizontal ?
                    padding.top + (svgDimensions.height / 2) :
                    padding.top + tick.offset;

                return (
                    <text
                        key={tick.value}
                        x={x}
                        y={y}
                        dominantBaseline='middle'
                        textAnchor='middle'
                        className='text-xs fill-on-surface-container'>
                        {tick.displayedValue}
                    </text>
                )
            })}
        </DataVisualisationSvg>
    )
}

function SecondaryAxisLines({ valuesScale, dimensions, selectedUnit, padding, orientation, className, style }: SecondaryAxisLinesParams) {
    const [svgDimensions, setSvgDimensions] = useState<Dimensions>({ width: 0, height: 0 });
    const ticks = useValuesTicks(valuesScale, orientation, dimensions, padding, selectedUnit);

    return (
        <div
            className={className}
            style={style}>
            <DataVisualisationSvg
                onDimensionsChange={(width, height) => setSvgDimensions({ width, height })}>
                {dimensions.width !== 0 && dimensions.height !== 0 && ticks.map((tick, index) => {
                    const x1 = orientation === ChartOrientation.Horizontal ?
                        padding.left + tick.offset :
                        padding.left;
                    const x2 = orientation === ChartOrientation.Horizontal ?
                        x1 :
                        padding.left + svgDimensions.width;
                    const y1 = orientation === ChartOrientation.Horizontal ?
                        padding.top :
                        padding.top + tick.offset;
                    const y2 = orientation === ChartOrientation.Horizontal ?
                        padding.top + svgDimensions.height :
                        y1;

                    return (
                        <line
                            key={tick.value}
                            x1={x1} y1={y1}
                            x2={x2} y2={y2}
                            strokeDasharray='0 6 6'
                            className='stroke-outline stroke-1' />
                    )
                })}
            </DataVisualisationSvg>
        </div>
    )
}

const PrimaryAxisLabels = forwardRef<HTMLDivElement, PrimaryAxisLabelsParams>(({ labels, orientation, className, dimensions, padding, secondaryAxisThickness }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                className,
                'relative grid isolate overflow-clip',
                orientation === ChartOrientation.Horizontal ?
                    'grid-rows-[1fr_auto]' :
                    'grid-cols-[auto_1fr]')}>
            <div
                className={cn(
                    className,
                    'flex justify-items-center justify-stretch min-w-0 max-w-full',
                    orientation === ChartOrientation.Horizontal ?
                        'flex-col items-end' :
                        'flex-row items-start')}
                style={{
                    width: orientation === ChartOrientation.Horizontal ? undefined : dimensions.width,
                    height: orientation === ChartOrientation.Horizontal ? dimensions.height : undefined,
                    marginLeft: orientation === ChartOrientation.Horizontal ? undefined : padding.left,
                    marginTop: orientation === ChartOrientation.Horizontal ? padding.top : undefined,
                    marginRight: orientation === ChartOrientation.Horizontal ? undefined : padding.right,
                    marginBottom: orientation === ChartOrientation.Horizontal ? padding.bottom : undefined,
                }}>
                {
                    labels.map((label) => {
                        return (
                            <div
                                key={label.key === undefined ? 'undefined' : label.key}
                                className='flex-1 min-h-0 grid items-center'>
                                <span
                                    className={cn('text-xs text-on-surface-container',
                                        orientation === ChartOrientation.Horizontal ?
                                            'text-end' :
                                            'text-center')}>
                                    {label.link ?
                                        <Link prefetch={false} href={label.link} className='hover:underline'>{label.label}</Link> :
                                        <>{label.label}</>}
                                </span>
                            </div>
                        )
                    })
                }
            </div>
            <div
                style={{
                    width: orientation === ChartOrientation.Horizontal ? undefined : secondaryAxisThickness,
                    height: orientation === ChartOrientation.Horizontal ? secondaryAxisThickness : undefined,
                }}
                className={cn(
                    'sticky bg-surface-container z-10',
                    orientation === ChartOrientation.Horizontal ?
                        'h-8 bottom-0 left-0 right-0 col-start-1 row-start-2' :
                        'w-8 top-0 bottom-0 left-0 col-start-1 row-start-1')}></div>
        </div>
    )
});

PrimaryAxisLabels.displayName = 'PrimaryAxisLabels';

/** Hook that manages dimensions of the chart SVG element. */
function useChartDimensions(bandsCount: number, bandThickness: number, orientation: ChartOrientation) {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgContainerDimenstions = useDimensions(svgContainerRef);

    const minSize = bandThickness * bandsCount;
    const dimensions = {
        width: orientation == ChartOrientation.Horizontal ?
            svgContainerDimenstions.width :
            minSize,
        height: orientation == ChartOrientation.Horizontal ?
            minSize :
            svgContainerDimenstions.height,
    };

    return {
        svgContainerRef,
        dimensions,
    }
}

/** Hook that returns a scale for ticks that can be displayed on the secondary axis. */
function useValuesTicks(
    valuesScale: d3.ScaleLinear<number, number, never>,
    orientation: ChartOrientation,
    dimensions: Dimensions,
    padding: EdgeRect,
    selectedUnit: ChartUnit
) {
    return useMemo(() => {
        const pixelsPerTick = 60;
        const length = orientation === ChartOrientation.Horizontal ?
            dimensions.width - padding.left - padding.right :
            dimensions.height - padding.top - padding.bottom;
        const numberOfTicksTarget = Math.max(1, Math.floor(length / pixelsPerTick));

        return valuesScale.ticks(numberOfTicksTarget)
            .filter(value => selectedUnit === ChartUnit.Percentage ? true : value % 1 === 0)
            .map(value => ({
                value,
                displayedValue: selectedUnit === ChartUnit.Percentage ? value.toLocaleString(undefined, { style: 'percent' }) : value,
                offset: (orientation === ChartOrientation.Horizontal ? valuesScale(value) : 1 - valuesScale(value)) * length
            }));
    }, [valuesScale, dimensions, selectedUnit, orientation, padding]);
}