'use client'

import { VisualDataContainer } from './VisualDataContainer'
import { useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'
import { cn, prependDashedPrefix } from '@/utils/tailwindUtils'
import Tabs from '../Tabs'

export type HorizontalBarChartData<T> = {
    color: (key: any) => string,
    barTitle?: (key: any) => string,
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
    innerClassName?: string
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
    padding: Padding,
    dimensions: Dimensions,
    rolledItems: d3.InternMap<any, number>,
    valuesScale: d3.ScaleLinear<number, number, never>,
    barLabelWidth: number,
    barLabelHorizontalGap: number,
    color: (key: any) => string,
    barTitle?: (key: any) => string
}

const UnitsType = {
    Count: 'Count',
    Percentage: 'Percentage'
} as const

type UnitsType = keyof typeof UnitsType

export default function HorizontalBarChart({ data, padding, className, innerClassName, unitsId }: HorizontalBarChartParams) {
    const [selectedUnitsType, setSelectedUnitsType] = useState<UnitsType>('Count');
    const [dimensions, setDimensions] = useState<Dimensions | null>(null);
    const [rolledItems, setRolledItems] = useState<d3.InternMap<any, number>>(new d3.InternMap<any, number>());

    const valuesLabelHeight = 36;
    const barLabelWidth = 110;
    const barLabelHorizontalGap = 30;
    const pad = padding || { left: 0, top: 20, right: 30, bottom: 20 + valuesLabelHeight };

    const chartWidth = useMemo(() =>
        (dimensions?.width || 1) - barLabelWidth - barLabelHorizontalGap - pad.left - pad.right,
        [dimensions]);
    const valuesDomain: [number, number] = useMemo(() =>
        [0, getTopDomainValue()],
        [rolledItems]);
    const valuesScale = useMemo(() =>
        d3.scaleLinear(valuesDomain, [0, chartWidth]),
        [chartWidth, valuesDomain]);

    useEffect(() => {
        const rolled = d3.rollup(data.items, r => r.length, data.bar);

        if (selectedUnitsType == UnitsType.Percentage) {
            const total = data.items.length;

            for (const key of rolled.keys()) {
                const value = rolled.get(key);
                if (total && value) {
                    rolled.set(key, value / total);
                }
            }
        }

        setRolledItems(rolled);
    }, [data, selectedUnitsType]);

    function getTopDomainValue() {
        return selectedUnitsType == UnitsType.Percentage ? 1 : (d3.extent(rolledItems.values()) as [number, number])[1]
    }

    return (
        <div
            className={cn(className, 'flex flex-col')}>
            <VisualDataContainer
                innerClassName={innerClassName}
                onDimensionsChange={(width, height) => setDimensions({ width, height })}>
                {
                    dimensions &&
                    <>
                        <text
                            x={pad.left + barLabelWidth + barLabelHorizontalGap + (chartWidth / 2)}
                            y={dimensions.height - 4}
                            textAnchor='middle'
                            className='text-sm fill-on-surface-container'>
                            {selectedUnitsType == UnitsType.Percentage ? '% of publications' : 'Publications Count'}
                        </text>

                        <Ticks
                            selectedUnitsType={selectedUnitsType}
                            dimensions={dimensions}
                            domain={valuesDomain}
                            scale={valuesScale}
                            padding={{ top: pad.top, bottom: pad.bottom, right: pad.right, left: pad.left + barLabelWidth + barLabelHorizontalGap }} />

                        <Chart
                            selectedUnitsType={selectedUnitsType}
                            valuesScale={valuesScale}
                            barLabelWidth={barLabelWidth}
                            barLabelHorizontalGap={barLabelHorizontalGap}
                            dimensions={dimensions}
                            padding={pad}
                            rolledItems={rolledItems}
                            color={data.color}
                            barTitle={data.barTitle} />
                    </>
                }
            </VisualDataContainer>
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
            .filter(value => selectedUnitsType == UnitsType.Percentage ? true : value % 1 == 0)
            .map(value => ({
                value,
                displayedValue: selectedUnitsType == UnitsType.Percentage ? value.toLocaleString(undefined, { style: 'percent' }) : value,
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

function Chart({ padding, rolledItems, valuesScale, dimensions, barLabelWidth, barLabelHorizontalGap, selectedUnitsType, color, barTitle }: ChartParams) {
    const barsScale = useMemo(() =>
        d3.scaleBand([0, dimensions.height - padding.top - padding.bottom]).domain(rolledItems.keys()),
        [dimensions, rolledItems]);

    return (
        <>
            {
                Array.from(rolledItems.keys()).map((key, index) => {
                    const value = rolledItems.get(key) as number;
                    const displayedValue = selectedUnitsType == UnitsType.Percentage ?
                        value.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 }) :
                        value.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    const bandWidth = barsScale.bandwidth();
                    const barHeight = Math.min(bandWidth, 28);
                    const yOffset = (bandWidth - barHeight) / 2;

                    const left = padding.left + barLabelWidth + barLabelHorizontalGap;
                    const top = (barsScale(key) || 0) + yOffset + padding.top;
                    const width = Math.max(valuesScale(value), 2);
                    const radius = Math.min(8, barHeight / 2, width / 2);

                    return (
                        <g
                            key={key}>
                            <foreignObject
                                x={padding.left} y={(barsScale(key) || 0) + padding.top}
                                width={barLabelWidth} height={bandWidth}>
                                <div
                                    className='flex items-center justify-end h-full'>
                                    <span className='text-xs text-end text-on-surface-container'>{barTitle && barTitle(key)}</span>
                                </div>
                            </foreignObject>

                            <rect
                                className={prependDashedPrefix('fill', color(key))}
                                x={left} y={top}
                                width={width} height={barHeight}
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
        </>
    )
}