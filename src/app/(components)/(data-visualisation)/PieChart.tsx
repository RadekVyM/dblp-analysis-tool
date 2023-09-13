'use client'

import { VisualDataContainer } from './VisualDataContainer'
import { useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import OutlinedText from './OutlinedText'
import { cn, prependDashedPrefix } from '@/shared/utils/tailwindUtils'
import removeOverlaps, { Label } from '@/shared/utils/simulatedAnnealing'
import { intersect, overlapArea } from '@/shared/utils/geometry'

export type PieChartData<T> = {
    color: (key: any) => string,
    pieceTitle?: (key: any) => string,
    piece: (value: T) => any,
    items: Array<T>
}

type ArcData = { key: any, value: number }

interface PieLabel extends Label<d3.PieArcDatum<ArcData>> {
    idealX: number,
    idealY: number,
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
    arcs: Array<d3.PieArcDatum<ArcData>>,
    data: PieChartData<any>,
}

type PieChartPiecesParams = {
    arcs: Array<d3.PieArcDatum<ArcData>>,
    data: PieChartData<any>,
    className?: string,
    arcToPath: (arc: d3.PieArcDatum<ArcData>) => string | undefined
}

type PieChartLabelsParams = {
    labels: Array<PieLabel>
}

const pie = d3.pie<any, { key: any, value: number }>()
    .sort((a, b) => d3.descending(a.value, b.value))
    .value((pair) => pair.value);

export default function PieChart({ data, padding, className, innerClassName, arcClassName }: PieChartParams) {
    const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);
    const [rolled, setRolled] = useState<d3.InternMap<any, number>>(new d3.InternMap<any, number>());

    useEffect(() => {
        setRolled(d3.rollup(data.items, r => r.length, data.piece));
    }, [data]);

    const arcs = useMemo(() =>
        pie(Array.from(rolled).map<ArcData>((pair) => ({ key: pair[0], value: pair[1] }))),
        [rolled]);

    const wholeArc = useMemo(() =>
        d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min((dimensions?.width || 1) * 0.5, (dimensions?.height || 1) * 0.4) - 1),
        [dimensions]);

    const labels = useMemo(() => {
        const newLabels = arcs.map<PieLabel>((arc) => {
            const center = wholeArc.centroid(arc as unknown as d3.DefaultArcObject);
            const x = center[0] * 1.2;
            const y = center[1] * 1.2;

            return {
                data: arc,
                x: x,
                y: y,
                anchorX: x,
                anchorY: y,
                idealX: x,
                idealY: y,
                width: 16 * arc.data.value.toString().length,
                height: 20,
                center: center
            }
        });

        handleOverlappingLabels(newLabels);
        return newLabels
    }, [arcs, wholeArc]);

    return (
        <div
            className={cn('flex flex-col @xl:flex-row gap-4 h-full', className)}>
            <PieChartLegend
                arcs={arcs}
                data={data} />

            <VisualDataContainer
                innerClassName={innerClassName}
                onDimensionsChange={(width, height) => setDimensions({ width, height })}>
                {
                    dimensions &&
                    <g
                        transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}>
                        <PieChartPieces
                            arcs={arcs}
                            data={data}
                            className={arcClassName}
                            arcToPath={(arc) => wholeArc(arc as unknown as d3.DefaultArcObject) || undefined} />

                        <PieChartLabels
                            labels={labels} />
                    </g>
                }
            </VisualDataContainer>
        </div>
    )
}

function PieChartLegend({ data, arcs }: PieChartLegendParams) {
    return (
        <ul
            className='flex flex-wrap @xl:flex-col gap-4 @xl:self-center'>
            {arcs.map((arc, index) => <li
                className={cn('grid grid-cols-[auto,1fr] gap-2 items-center before:content-[""] before:block before:rounded-md before:w-4 before:h-4',
                    `before:${prependDashedPrefix('bg', data.color(arc.data.key))}`)}
                key={`legend-label-${arc.data.key}`}>
                <span
                    className='text-sm'>
                    {data.pieceTitle && data.pieceTitle(arc.data.key)}
                </span>
            </li>)}
        </ul>
    )
}

function PieChartPieces({ data, arcs, className, arcToPath }: PieChartPiecesParams) {
    return (
        <>
            {arcs.length > 0 && arcs.map((arc) =>
                <path
                    strokeLinejoin='round'
                    strokeLinecap='round'
                    key={`arc-${arc.data.key}`}
                    className={cn(prependDashedPrefix('fill', data.color(arc.data.key)), className)}
                    d={arcToPath(arc)} />)}
        </>
    )
}

function PieChartLabels({ labels }: PieChartLabelsParams) {
    return (
        <>
            {labels.length > 0 && labels.map((label) => {
                const lineWidth = label.width * 0.75;

                return (
                    (label.idealX != label.x || label.idealY != label.y) &&
                    <g
                        key={`value-line-${label.data.data.key}`}>
                        <line
                            className='stroke-1 stroke-outline'
                            x1={label.x - (lineWidth / 2)} y1={label.y + 4}
                            x2={label.idealX} y2={label.idealY} />
                        <line
                            className='stroke-1 stroke-outline'
                            x1={label.x + (lineWidth / 2)} y1={label.y + 4}
                            x2={label.x - (lineWidth / 2)} y2={label.y + 4} />
                    </g>)
            })}

            {labels.length > 0 && labels.map((label) =>
                <OutlinedText
                    key={`value-label-${label.data.data.key}`}
                    x={label.x} y={label.y} width={label.width}
                    textAnchor='middle'>
                    {label.data.data.value}
                </OutlinedText>)}
        </>
    )
}

function handleOverlappingLabels(newLabels: Array<PieLabel>) {
    const overlappingLabels = newLabels.filter((label) => newLabels.some((l) => l == label ? false : (overlapArea(l, label) > 0)));

    overlappingLabels.forEach((label) => {
        const center = label.center;
        label.anchorX = label.x = center[0] * 2.2;
        label.anchorY = label.y = center[1] * 2.2;
        label.idealX = center[0] * 2;
        label.idealY = center[1] * 2;
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
                return intersect([f.x, f.y], [f.idealX, f.idealY], [s.x, s.y], [s.idealX, s.idealY])
            }
        });
    }
}