'use client'

import { DataVisualisationSvg } from './DataVisualisationSvg'
import { useEffect, useState, useMemo, useRef, forwardRef, CSSProperties } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'
import { cn, prependDashedPrefix } from '@/utils/tailwindUtils'
import Tabs from '../Tabs'
import useDimensions from '@/hooks/useDimensions'

export type HorizontalBarChartData<T> = {
    color: (key: any) => string,
    barTitle?: (key: any) => string,
    /** Defines a property that specifies a bar of the chart. Items are assigned to a bar based on this property. */
    bar: (item: T) => any,
    items: Array<T>
}

type Padding = { left: number, top: number, right: number, bottom: number }

type Dimensions = { width: number, height: number }

type HorizontalBarChartParams = {
    unitsId: string,
    data: HorizontalBarChartData<any>,
    padding?: Padding,
    className?: string,
    innerClassName?: string,
    orientation?: BarChartOrientation
}

type TicksParams = {
    selectedUnitsType: UnitsType,
    scale: d3.ScaleLinear<number, number, never>,
    domain: [number, number],
    dimensions: Dimensions,
    padding: Padding,
}

type ChartParams = {
    selectedUnitsType: UnitsType,
    dimensions: Dimensions,
    rolledItems: d3.InternMap<any, number>,
    valuesScale: d3.ScaleLinear<number, number, never>,
    orientation: BarChartOrientation,
    color: (key: any) => string,
}

type PrimaryAxisLabelsParams = {
    rolledItems: d3.InternMap<any, number>,
    orientation: BarChartOrientation,
    className?: string,
    style?: CSSProperties,
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

/** Chart that displays data as horizontal bars. */
export default function HorizontalBarChart({ data, padding, className, innerClassName, unitsId, orientation }: HorizontalBarChartParams) {
    orientation ??= BarChartOrientation.Horizontal;

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
        dimensions,
        scrollable
    } = useChartDimensions(rolledItems.size, 75, orientation);

    function getTopDomainValue() {
        return selectedUnitsType === UnitsType.Percentage ? 1 : (d3.extent(rolledItems.values()) as [number, number])[1];
    }

    return (
        <div
            className={cn(className, 'overflow-hidden grid grid-rows-[1fr_auto]')}>
            <div
                className={cn(
                    'overflow-auto',
                    'grid gap-x-4 thin-scrollbar scroll-gutter-stable box-border max-w-full max-h-full h-full w-full min-h-0 min-w-0',
                    orientation === BarChartOrientation.Horizontal ?
                        'grid-cols-[10rem_1fr]' :
                        'grid-rows-[1fr_4rem]'
                )}>
                <PrimaryAxisLabels
                    orientation={orientation || BarChartOrientation.Horizontal}
                    rolledItems={rolledItems}
                    barTitle={data.barTitle}
                    style={{
                        width: orientation === BarChartOrientation.Horizontal ? undefined : dimensions.width,
                        height: orientation === BarChartOrientation.Horizontal ? dimensions.height : undefined
                    }}
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
                            'order-2 grid-rows-[1fr_0] grid-cols-1' :
                            'order-1 grid-cols-[0_1fr] grid-rows-1'
                    )}>
                    <Chart
                        dimensions={dimensions}
                        color={data.color}
                        orientation={orientation}
                        rolledItems={rolledItems}
                        selectedUnitsType={selectedUnitsType}
                        valuesScale={valuesScale} />
                    <span
                        className={cn(
                            'sticky',
                            orientation === BarChartOrientation.Horizontal ?
                                'bottom-0 left-0 right-0 col-start-1 row-start-2 self-end justify-self-stretch' :
                                'top-0 bottom-0 left-0 col-start-1 row-start-1 self-stretch justify-self-start'
                        )}>
                        Ticks
                    </span>
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

function Ticks({ scale, dimensions, padding, domain, selectedUnitsType }: TicksParams) {
    const ticks = useMemo(() => {
        const pixelsPerTick = 80;
        const numberOfTicksTarget = Math.max(1, Math.floor((dimensions?.width || 1) / pixelsPerTick));

        return scale.ticks(numberOfTicksTarget)
            .filter(value => selectedUnitsType === UnitsType.Percentage ? true : value % 1 === 0)
            .map(value => ({
                value,
                displayedValue: selectedUnitsType === UnitsType.Percentage ? value.toLocaleString(undefined, { style: 'percent' }) : value,
                xOffset: scale(value)
            }));
    }, [scale, dimensions, selectedUnitsType]);

    return (
        <>
            {ticks.map((tick, index) => {
                const left = padding.left + tick.xOffset;
                const textVerticalOffset = 8;
                const textAnchor = 'middle';

                return (
                    <g
                        key={tick.xOffset}>
                        <line
                            x1={left} y1={padding.top}
                            x2={left} y2={dimensions.height - padding.bottom}
                            strokeDasharray='0 6 6'
                            className='stroke-outline stroke-1' />

                        <text
                            x={left}
                            y={padding.top - textVerticalOffset}
                            textAnchor={textAnchor}
                            className='text-xs fill-on-surface-container'>
                            {tick.displayedValue}
                        </text>

                        <text
                            x={left}
                            y={dimensions.height - padding.bottom + textVerticalOffset}
                            dominantBaseline='hanging' textAnchor={textAnchor}
                            className='text-xs fill-on-surface-container'>
                            {tick.displayedValue}
                        </text>
                    </g>
                )
            })}
        </>
    )
}

function Chart({ rolledItems, valuesScale, dimensions, selectedUnitsType, orientation, color }: ChartParams) {
    const secondaryAxisLength = orientation === BarChartOrientation.Horizontal ?
        dimensions.width :
        dimensions.height;
    const primaryAxisLength = orientation === BarChartOrientation.Horizontal ?
        dimensions.height :
        dimensions.width;
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
                    const length = secondaryAxisLength * valuesScale(value);

                    const left = orientation === BarChartOrientation.Horizontal ? 0 : offset;
                    const top = orientation === BarChartOrientation.Horizontal ? offset : secondaryAxisLength - length;
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
                                x={left + (width / 2)} y={top + (barHeight / 2) + 2}
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

const PrimaryAxisLabels = forwardRef<HTMLDivElement, PrimaryAxisLabelsParams>(({ rolledItems, orientation, className, style, barTitle }, ref) => {
    return (
        <div
            ref={ref}
            style={style}
            className={cn(
                className,
                'flex justify-items-center justify-stretch',
                orientation === BarChartOrientation.Horizontal ?
                    'flex-col' :
                    'flex-row')}>
            {
                Array.from(rolledItems.keys()).map((key, index) => {
                    return (
                        <div
                            key={key}
                            className='flex-1 grid items-center'>
                            <span className='text-xs text-center text-on-surface-container'>{barTitle && barTitle(key)}</span>
                        </div>
                    )
                })
            }
        </div>
    )
});

PrimaryAxisLabels.displayName = 'PrimaryAxisLabels';

function useChartDimensions(bandsCount: number, minBandSize: number, orientation: BarChartOrientation) {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgContainerDimenstions = useDimensions(svgContainerRef);

    const minSize = minBandSize * bandsCount;
    const dimensions = {
        width: orientation == BarChartOrientation.Horizontal ?
            svgContainerDimenstions.width :
            minSize,
        height: orientation == BarChartOrientation.Horizontal ?
            minSize :
            svgContainerDimenstions.height,
    };

    let scrollable = false;

    if (orientation === BarChartOrientation.Horizontal) {
        if (dimensions.height < minSize) {
            dimensions.height = minSize;
            scrollable = true;
        }
    }
    if (orientation === BarChartOrientation.Vertical) {
        if (dimensions.width < minSize) {
            dimensions.width = minSize;
            scrollable = true;
        }
    }

    return {
        svgContainerRef,
        dimensions,
        scrollable
    }
}