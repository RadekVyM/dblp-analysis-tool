'use client'

import { DataVisualisationSvg } from './DataVisualisationSvg'
import { useState, useMemo, useRef, forwardRef, CSSProperties } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'
import { cn, prependDashedPrefix } from '@/utils/tailwindUtils'
import Tabs from '../Tabs'
import useDimensions from '@/hooks/useDimensions'

export type BarChartData<T> = {
    color: (key: any) => string,
    barTitle?: (key: any) => string,
    /** Defines a property that specifies a bar of the chart. Items are assigned to a bar based on this property. */
    bar: (item: T) => any,
    items: Array<T>
}

type Padding = { left: number, top: number, right: number, bottom: number }

type Dimensions = { width: number, height: number }

type BarChartParams = {
    unitsId: string,
    data: BarChartData<any>,
    bandThickness?: number,
    secondaryAxisThickness?: number,
    className?: string,
    orientation?: BarChartOrientation
}

type TicksParams = {
    orientation: BarChartOrientation,
    selectedUnitsType: UnitsType,
    padding: Padding,
    scale: d3.ScaleLinear<number, number, never>,
    dimensions: Dimensions,
    className?: string,
    style?: CSSProperties,
}

type ChartParams = {
    selectedUnitsType: UnitsType,
    dimensions: Dimensions,
    padding: Padding,
    rolledItems: d3.InternMap<any, number>,
    valuesScale: d3.ScaleLinear<number, number, never>,
    orientation: BarChartOrientation,
    color: (key: any) => string,
}

type PrimaryAxisLabelsParams = {
    rolledItems: d3.InternMap<any, number>,
    orientation: BarChartOrientation,
    dimensions: Dimensions,
    padding: Padding,
    className?: string,
    barTitle?: (key: any) => string,
}

const UnitsType = {
    Count: 'Count',
    Percentage: 'Percentage'
} as const;

type UnitsType = keyof typeof UnitsType

const BarChartOrientation = {
    Horizontal: 'Horizontal',
    Vertical: 'Vertical'
} as const;

type BarChartOrientation = keyof typeof BarChartOrientation

/** Chart that displays data as bars. */
export default function BarChart({ data, className, bandThickness, secondaryAxisThickness, unitsId, orientation }: BarChartParams) {
    orientation ??= BarChartOrientation.Horizontal;
    bandThickness ??= 75;
    secondaryAxisThickness ??= 40;
    const chartPadding: Padding = orientation == BarChartOrientation.Horizontal ?
        { left: 40, top: 0, right: 40, bottom: 0 } :
        { left: 0, top: 40, right: 0, bottom: 40 };
    const [selectedUnitsType, setSelectedUnitsType] = useState<UnitsType>('Count');
    const rolledItems = useMemo<d3.InternMap<any, number>>(() => {
        const rolled = d3.rollup(data.items, r => r.length, data.bar);

        if (selectedUnitsType === UnitsType.Percentage) {
            const total = data.items.length;

            for (const key of rolled.keys()) {
                const value = rolled.get(key);
                if (total && value) {
                    rolled.set(key, value / total);
                }
            }
        }

        return rolled;
    }, [data, selectedUnitsType]);
    const valuesDomain: [number, number] = useMemo(() =>
        [0, getTopDomainValue()],
        [rolledItems, selectedUnitsType]);
    const valuesScale = useMemo(() =>
        d3.scaleLinear(valuesDomain, [0, 1]),
        [valuesDomain]);

    const {
        svgContainerRef,
        dimensions
    } = useChartDimensions(rolledItems.size, bandThickness, orientation);

    function getTopDomainValue() {
        const max = (d3.extent(rolledItems.values()) as [number, number])[1];

        return selectedUnitsType === UnitsType.Percentage ?
            1 :
            Math.ceil(max / 10) * 10;
    }

    return (
        <div
            className={cn(className, 'overflow-hidden grid grid-rows-[1fr_auto]')}>
            <div
                className={cn(
                    'overflow-auto',
                    'grid thin-scrollbar scroll-gutter-stable box-border max-w-full max-h-full h-full w-full min-h-0 min-w-0',
                    orientation === BarChartOrientation.Horizontal ?
                        'grid-cols-[minmax(8rem,0.25fr)_1fr]' :
                        'grid-rows-[1fr_4rem]'
                )}>
                <PrimaryAxisLabels
                    orientation={orientation || BarChartOrientation.Horizontal}
                    rolledItems={rolledItems}
                    barTitle={data.barTitle}
                    dimensions={dimensions}
                    padding={chartPadding}
                    className={cn(
                        'm-auto',
                        orientation === BarChartOrientation.Horizontal ?
                            'order-1' :
                            'order-2'
                    )} />
                <div
                    ref={svgContainerRef}
                    className={cn(
                        'relative',
                        'w-full h-full min-h-0 min-w-0 grid place-items-center',
                        orientation === BarChartOrientation.Horizontal ?
                            'order-2 grid-rows-[1fr_auto] grid-cols-1' :
                            'order-1 grid-cols-[auto_1fr] grid-rows-1'
                    )}>
                    <Chart
                        padding={chartPadding}
                        dimensions={dimensions}
                        color={data.color}
                        orientation={orientation}
                        rolledItems={rolledItems}
                        selectedUnitsType={selectedUnitsType}
                        valuesScale={valuesScale} />
                    <Ticks
                        orientation={orientation}
                        padding={chartPadding}
                        dimensions={dimensions}
                        selectedUnitsType={selectedUnitsType}
                        scale={valuesScale}
                        style={{
                            width: orientation === BarChartOrientation.Horizontal ? undefined : secondaryAxisThickness,
                            height: orientation === BarChartOrientation.Horizontal ? secondaryAxisThickness : undefined,
                        }}
                        className={cn(
                            'sticky bg-surface-container',
                            orientation === BarChartOrientation.Horizontal ?
                                'bottom-0 left-0 right-0 col-start-1 row-start-2 self-end justify-self-stretch' :
                                'top-0 bottom-0 left-0 col-start-1 row-start-1 self-stretch justify-self-start'
                        )} />
                </div>
            </div>
            <Tabs
                className='mx-auto mt-6 w-fit'
                size='xs'
                legend='Choose units'
                tabsId={unitsId}
                selectedId={selectedUnitsType}
                setSelectedId={setSelectedUnitsType}
                items={[
                    {
                        content: 'Publications Count',
                        id: UnitsType.Count
                    },
                    {
                        content: '% of publications',
                        id: UnitsType.Percentage
                    }
                ]} />
        </div>
    )
}

function Ticks({ scale, dimensions, selectedUnitsType, padding, orientation, className, style }: TicksParams) {
    const [svgWidth, setSvgWidth] = useState(0);
    const ticks = useMemo(() => {
        const pixelsPerTick = 60;
        const length = orientation === BarChartOrientation.Horizontal ?
            dimensions.width - padding.left - padding.right :
            dimensions.height - padding.top - padding.bottom;
        const numberOfTicksTarget = Math.max(1, Math.floor(length / pixelsPerTick));

        return scale.ticks(numberOfTicksTarget)
            .filter(value => selectedUnitsType === UnitsType.Percentage ? true : value % 1 === 0)
            .map(value => ({
                value,
                displayedValue: selectedUnitsType === UnitsType.Percentage ? value.toLocaleString(undefined, { style: 'percent' }) : value,
                offset: scale(value) * length
            }));
    }, [scale, dimensions, selectedUnitsType, orientation]);

    return (
        <DataVisualisationSvg
            className={className}
            style={style}
            onDimensionsChange={(width, height) => setSvgWidth(width)}>
            {ticks.map((tick, index) => {
                const x = orientation === BarChartOrientation.Horizontal ?
                    padding.left + tick.offset :
                    padding.left + (svgWidth / 2);
                const y = orientation === BarChartOrientation.Horizontal ?
                    padding.top + 8 :
                    padding.top + tick.offset;

                return (
                    <g
                        key={tick.offset}>
                        <line
                            x1={x} y1={0}
                            x2={x} y2={0}
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
        </DataVisualisationSvg>
    )
}

function Chart({ rolledItems, valuesScale, dimensions, selectedUnitsType, orientation, padding, color }: ChartParams) {
    const secondaryAxisLength = orientation === BarChartOrientation.Horizontal ?
        dimensions.width - padding.left - padding.right :
        dimensions.height - padding.top - padding.bottom;
    const primaryAxisLength = orientation === BarChartOrientation.Horizontal ?
        dimensions.height - padding.top - padding.bottom :
        dimensions.width - padding.left - padding.right;
    const barsScale = useMemo(() =>
        d3.scaleBand([0, primaryAxisLength]).domain(rolledItems.keys()),
        [rolledItems, primaryAxisLength]);

    return (
        <svg
            width={dimensions.width}
            height={dimensions.height}
            style={{
                width: orientation === BarChartOrientation.Horizontal ? undefined : dimensions.width,
                height: orientation === BarChartOrientation.Horizontal ? dimensions.height : undefined
            }}
            className='w-full h-full relative'>
            {
                Array.from(rolledItems.keys()).map((key, index) => {
                    const value = rolledItems.get(key) as number;
                    const displayedValue = selectedUnitsType === UnitsType.Percentage ?
                        value.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 }) :
                        value.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    const bandWidth = barsScale.bandwidth();
                    const barHeight = Math.min(bandWidth, 28);
                    const offset = (barsScale(key) || 0) + (bandWidth - barHeight) / 2;
                    const length = Math.max(0, secondaryAxisLength * valuesScale(value));

                    const left = padding.left + (orientation === BarChartOrientation.Horizontal ? 0 : offset);
                    const top = padding.top + (orientation === BarChartOrientation.Horizontal ? offset : secondaryAxisLength - length);
                    const width = orientation === BarChartOrientation.Horizontal ? length : barHeight;
                    const height = orientation === BarChartOrientation.Horizontal ? barHeight : length;
                    const radius = Math.min(8, barHeight / 2, width / 2);

                    return (
                        <g
                            key={key}>
                            <rect
                                className={prependDashedPrefix('fill', color(key))}
                                x={left} y={top}
                                width={width} height={height}
                                rx={radius} ry={radius} />

                            <OutlinedText
                                x={left + (width / 2)} y={top + (height / 2) + 2}
                                dominantBaseline='middle' textAnchor='middle'
                                className='text-xs font-semibold'>
                                {displayedValue}
                            </OutlinedText>
                        </g>
                    )
                })
            }
        </svg>
    )
}

const PrimaryAxisLabels = forwardRef<HTMLDivElement, PrimaryAxisLabelsParams>(({ rolledItems, orientation, className, dimensions, padding, barTitle }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                className,
                'relative grid isolate',
                orientation === BarChartOrientation.Horizontal ?
                    'grid-rows-[1fr_auto]' :
                    'grid-cols-[auto_1fr]')}>
            <div
                className={cn(
                    className,
                    'relative flex justify-items-center justify-stretch',
                    orientation === BarChartOrientation.Horizontal ?
                        'flex-col items-end' :
                        'flex-row items-start')}
                style={{
                    width: orientation === BarChartOrientation.Horizontal ? undefined : dimensions.width,
                    height: orientation === BarChartOrientation.Horizontal ? dimensions.height : undefined,
                    marginLeft: orientation === BarChartOrientation.Horizontal ? undefined : padding.left,
                    marginTop: orientation === BarChartOrientation.Horizontal ? padding.top : undefined,
                    marginRight: orientation === BarChartOrientation.Horizontal ? undefined : padding.right,
                    marginBottom: orientation === BarChartOrientation.Horizontal ? padding.bottom : undefined,
                }}>
                {
                    Array.from(rolledItems.keys()).map((key, index) => {
                        return (
                            <div
                                key={key}
                                className='flex-1 grid items-center'>
                                <span
                                    className={cn('text-xs text-on-surface-container',
                                        orientation === BarChartOrientation.Horizontal ?
                                            'text-end' :
                                            'text-center')}>
                                    {barTitle && barTitle(key)}
                                </span>
                            </div>
                        )
                    })
                }
            </div>
            <div className={cn(
                'sticky bg-surface-container z-10',
                orientation === BarChartOrientation.Horizontal ?
                    'h-8 bottom-0 left-0 right-0 col-start-1 row-start-2' :
                    'w-8 top-0 bottom-0 left-0 col-start-1 row-start-1')}></div>
        </div>
    )
});

PrimaryAxisLabels.displayName = 'PrimaryAxisLabels';

function useChartDimensions(bandsCount: number, bandThickness: number, orientation: BarChartOrientation) {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgContainerDimenstions = useDimensions(svgContainerRef);

    const minSize = bandThickness * bandsCount;
    const dimensions = {
        width: orientation == BarChartOrientation.Horizontal ?
            svgContainerDimenstions.width :
            minSize,
        height: orientation == BarChartOrientation.Horizontal ?
            minSize :
            svgContainerDimenstions.height,
    };

    return {
        svgContainerRef,
        dimensions,
    }
}