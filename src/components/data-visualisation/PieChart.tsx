'use client'

import { DataVisualisationSvg } from './DataVisualisationSvg'
import { useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'
import { cn, prependDashedPrefix } from '@/utils/tailwindUtils'
import removeOverlaps, { Label } from '@/utils/simulatedAnnealing'
import { distance, intersect, overlapArea } from '@/utils/geometry'

export type PieChartData<T> = {
    color: (key: any) => string,
    sliceTitle?: (key: any) => string,
    /** Defines a property that specifies a slice of the chart. Items are assigned to a slice based on this property. */
    slice: (item: T) => any,
    items: Array<T>
}

type ArcData = { key: any, value: number }

type PieArc = d3.PieArcDatum<ArcData>

type PieLabel = Label<PieArc> & {
    anchorX: number,
    anchorY: number,
    center: [number, number]
}

type PieChartParams = {
    data: PieChartData<any>,
    padding?: { left: number, top: number, right: number, bottom: number },
    className?: string,
    innerClassName?: string,
    arcClassName?: string,
}

type PieChartLegendParams = {
    arcs: Array<PieArc>,
    data: PieChartData<any>,
    hoveredSlice: PieArc | null,
    onSliceHover: (arc: PieArc | null) => void,
}

type PieChartSlicesParams = {
    onSliceHover: (arc: PieArc | null) => void,
    color: (key: any) => string,
    hoveredSlice: PieArc | null,
    arcs: Array<PieArc>,
    defaultRadius: number,
    className?: string
}

type PieChartSliceParams = {
    onSliceHover: (arc: PieArc | null) => void,
    color: (key: any) => string,
    hoveredSlice: PieArc | null,
    arc: PieArc,
    defaultRadius: number,
    className?: string
}

type PieChartLabelsParams = {
    defaultRadius: number,
    arcs: Array<PieArc>,
    hoveredSlice: PieArc | null
}

type PieChartLabelPolylineParams = {
    label: PieLabel
}

const pie = d3.pie<any, { key: any, value: number }>()
    .sort((a, b) => d3.ascending(a.value, b.value))
    .value((pair) => pair.value);

/** Displays data in a pie chart. */
export default function PieChart({ data, padding, className, innerClassName, arcClassName }: PieChartParams) {
    const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);
    const [rolled, setRolled] = useState<d3.InternMap<any, number>>(new d3.InternMap<any, number>());
    const [hoveredSlice, setHoveredSlice] = useState<PieArc | null>(null);

    const arcs = useMemo(() => {
        const newArcs = pie(Array.from(rolled).map<ArcData>((pair) => ({ key: pair[0], value: pair[1] })));
        newArcs.sort((a, b) => a.value - b.value);
        return newArcs;
    }, [rolled]);

    const defaultRadius = useMemo(() =>
        Math.min((dimensions?.width || 1) * 0.4, (dimensions?.height || 1) * 0.4) - 1,
        [dimensions]);

    useEffect(() =>
        setRolled(d3.rollup(data.items, r => r.length, data.slice)),
        [data]);

    return (
        <div
            className={cn('flex flex-col @xl:flex-row gap-4 h-full', className)}>
            <PieChartLegend
                arcs={arcs}
                data={data}
                hoveredSlice={hoveredSlice}
                onSliceHover={(arc) => setHoveredSlice(arc)} />

            <DataVisualisationSvg
                innerClassName={cn('overflow-visible', innerClassName)}
                onDimensionsChange={(width, height) => setDimensions({ width, height })}>
                {
                    dimensions && defaultRadius > 0 && arcs.length > 0 &&
                    <g
                        transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}>
                        <PieChartSlices
                            arcs={arcs}
                            defaultRadius={defaultRadius}
                            color={data.color}
                            onSliceHover={(arc) => setHoveredSlice(arc)}
                            hoveredSlice={hoveredSlice}
                            className={arcClassName} />

                        <PieChartLabels
                            defaultRadius={defaultRadius}
                            arcs={arcs}
                            hoveredSlice={hoveredSlice} />
                    </g>
                }
            </DataVisualisationSvg>
        </div>
    )
}

/** Displays a legend for individual slices of a pie chart. */
function PieChartLegend({ data, arcs, hoveredSlice, onSliceHover }: PieChartLegendParams) {
    return (
        <ul
            className='flex flex-wrap @xl:flex-col gap-5 @xl:self-center'>
            {arcs.map((arc) =>
                <li
                    onPointerOver={() => onSliceHover(arc)}
                    onPointerOut={() => onSliceHover(null)}
                    className={cn(
                        'grid grid-cols-[auto,1fr] gap-4 items-center',
                        'before:content-[""] before:block before:rounded-md before:w-3 before:h-3 before:transition-all before:outline-transparent before:outline before:outline-offset-2 before:outline-2',
                        `before:${prependDashedPrefix('bg', data.color(arc.data.key))}`,
                        arc.data.key == hoveredSlice?.data.key ? `before:${prependDashedPrefix('outline', data.color(arc.data.key))}` : '')}
                    key={`legend-label-${arc.data.key}`}>
                    <span
                        className='text-sm'>
                        {data.sliceTitle && data.sliceTitle(arc.data.key)}
                    </span>
                </li>)}
        </ul>
    )
}

function PieChartSlices({ arcs, className, defaultRadius, hoveredSlice, color, onSliceHover }: PieChartSlicesParams) {
    return (
        <>
            {arcs.length > 0 && arcs.map((arc) =>
                <PieChartSlice
                    color={color}
                    onSliceHover={onSliceHover}
                    hoveredSlice={hoveredSlice}
                    key={`slice-${arc.data.key}`}
                    arc={arc}
                    defaultRadius={defaultRadius}
                    className={className} />)}
        </>
    )
}

function PieChartSlice({ arc, defaultRadius, className, hoveredSlice, color, onSliceHover }: PieChartSliceParams) {
    const [radiusAddition, setRadiusAddition] = useState(0);
    const wholeArc = createWholeArc(defaultRadius + radiusAddition);

    useEffect(() => {
        setRadiusAdditionAnimated(hoveredSlice == arc ? 5 : 0)
    }, [hoveredSlice]);

    function setRadiusAdditionAnimated(to: number) {
        const old = radiusAddition;

        d3.selection()
            .transition(`slice-reveal-animation-${arc.data.key}`)
            .duration(150)
            .ease(d3.easeSinInOut)
            .tween('percentVisible', () => {
                const percentInterpolate = d3.interpolate(old, to);
                return t => setRadiusAddition(percentInterpolate(t));
            });
    }

    return (
        <path
            strokeLinejoin='round'
            strokeLinecap='round'
            onPointerOver={() => onSliceHover(arc)}
            onPointerOut={() => onSliceHover(null)}
            className={cn(prependDashedPrefix('fill', color(arc.data.key)), className)}
            d={wholeArc(arc as unknown as d3.DefaultArcObject) || ''} />
    )
}

/** Displays labels of the pie chart slices and handles their overlapping. */
function PieChartLabels({ arcs, defaultRadius, hoveredSlice }: PieChartLabelsParams) {
    const labels = useMemo(() => {
        const newLabels = mapArcsToLabels(defaultRadius, arcs);
        handleOverlappingLabels(newLabels);
        return newLabels;
    }, [arcs, defaultRadius]);

    return (
        <>
            {labels.length > 0 && labels.map((label) =>
                <PieChartLabelPolyline
                    key={`slice-label-line-${label.data.data.key}`}
                    label={label} />)}

            {labels.length > 0 && labels.map((label) =>
                <OutlinedText
                    key={`slice-label-${label.data.data.key}`}
                    x={label.x} y={label.y} width={label.width}
                    textAnchor='middle'
                    className={cn('pointer-events-none text-sm font-semibold transition-all', label.data.data.key == hoveredSlice?.data.key ? 'text-base' : '')}>
                    {label.data.data.value}
                </OutlinedText>)}
        </>
    )
}

/**
 * Polyline that leads from a label to a specific slice of a pie chart.
 * If no polyline is needed, it is not rendered.
 */
function PieChartLabelPolyline({ label }: PieChartLabelPolylineParams) {
    if (label.anchorX === label.x && label.anchorY === label.y) {
        return undefined;
    }

    const lineWidth = label.width * 0.75;

    const first: [number, number] = [label.anchorX, label.anchorY];
    const second: [number, number] = [label.x - (lineWidth / 2), label.y + 4];
    const third: [number, number] = [label.x + (lineWidth / 2), label.y + 4];

    const order = distance(first, second) < distance(first, third);

    return (
        <polyline
            points={[first.join(','), order ? second.join(',') : third.join(','), order ? third.join(',') : second.join(',')].join(' ')}
            className='stroke-1 stroke-outline fill-none pointer-events-none'
            strokeLinejoin='round' strokeLinecap='round'>
        </polyline>
    );
}

function mapArcsToLabels(defaultRadius: number, arcs: Array<PieArc>): Array<PieLabel> {
    const wholeArc = createWholeArc(defaultRadius);

    return arcs.map<PieLabel>((arc) => {
        const center = wholeArc.centroid(arc as unknown as d3.DefaultArcObject);
        const x = center[0] * 1.2;
        const y = center[1] * 1.2;

        return {
            data: arc,
            x: x,
            y: y,
            idealX: x,
            idealY: y,
            anchorX: x,
            anchorY: y,
            width: 16 * arc.data.value.toString().length,
            height: 20,
            center: center
        };
    });
}

function handleOverlappingLabels(newLabels: Array<PieLabel>) {
    const overlappingLabels = newLabels.filter((label) => newLabels.some((l) => l == label ? false : (overlapArea(l, label) > 0)));

    overlappingLabels.forEach((label) => {
        const center = label.center;
        label.idealX = label.x = center[0] * 2.2;
        label.idealY = label.y = center[1] * 2.2;
        label.anchorX = center[0] * 2;
        label.anchorY = center[1] * 2;
    });

    if (overlappingLabels.length > 0) {
        removeOverlaps(overlappingLabels, {
            moveBy: (label) => {
                // Rotate the point by a random angle
                const rand = Math.min(0.055, Math.max(-0.055, Math.random() - 0.5));
                const sin = Math.sin(rand);
                const cos = Math.cos(rand);

                //const [x, y] = scaleToLength([label.anchorY, -label.anchorX], Math.random());
                const [x, y] = [((label.x * cos) - (label.y * sin)) - label.x, ((label.y * cos) + (label.x * sin)) - label.y];
                return [x, y]
            },
            linesIntersect: (first, second) => {
                const f = first as PieLabel;
                const s = second as PieLabel;
                return intersect([f.x, f.y], [f.anchorX, f.anchorY], [s.x, s.y], [s.anchorX, s.anchorY]);
            }
        });
    }
}

function createWholeArc(outerRadius: number) {
    return d3.arc()
        .cornerRadius(6)
        .innerRadius(0)
        .outerRadius(outerRadius);
}