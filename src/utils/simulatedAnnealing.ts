// Based on:
// http://vis.berkeley.edu/courses/cs294-10-fa13/wiki/images/5/55/FP_EvanWang_paper.pdf
// https://medium.com/@adarshlilha/removing-label-overlapping-from-pretty-charts-8dd2e3581b71

import { overlapArea } from './geometry'

// One sweep means that, on average, each label is translated once
const DEFAULT_SWEEPS_COUNT = 50;
// Maximum distance a label can move at once
const MAX_MOVE_DISTANCE = 10;
const LABEL_LABEL_OVERLAP_WEIGHT = 30;
const LABEL_DISTANCE_WEIGHT = 2;
const LINES_INTERSECT_WEIGHT = 200000;

/** Describes a label that should not overlap with others. */
export type Label<T> = BaseLabel & {
    data: T
}

type BaseLabel = {
    x: number,
    y: number,
    width: number,
    height: number,
    idealX: number,
    idealY: number
}

type OccupiableArea = { x1: number, y1: number, x2: number, y2: number, }

/**
 * Ensures that labels do not overlap using simulated annealing. This function modifies the input array and returns it.
 * 
 * The implementation is based on this paper:
 * - http://vis.berkeley.edu/courses/cs294-10-fa13/wiki/images/5/55/FP_EvanWang_paper.pdf
 * @param labels Array of labels
 * @param options Options of the simulated annealing
 * @returns Input array of modified labels
 */
export default function removeOverlaps<T>(
    labels: Array<Label<T>>,
    options?: {
        area?: OccupiableArea,
        sweepsCount?: number,
        moveBy?: (label: BaseLabel) => [number, number],
        linesIntersect?: (first: BaseLabel, second: BaseLabel) => boolean,
    }): Array<Label<T>> {
    const initialTemp = 1;
    let currentTemp = initialTemp;

    for (let i = 0; i < (options?.sweepsCount || DEFAULT_SWEEPS_COUNT); i++) {
        // One sweep means that, on average, each label is translated once
        for (let j = 0; j < labels.length; j++) {
            executeMove(labels, currentTemp, options?.area, options?.moveBy, options?.linesIntersect);  
        }
        currentTemp = coolTemperature(initialTemp, currentTemp, options?.sweepsCount || DEFAULT_SWEEPS_COUNT);
    }

    return labels;
}

function executeMove(
    labels: Array<BaseLabel>,
    currentTemp: number,
    area?: OccupiableArea,
    moveBy?: (label: BaseLabel) => [number, number],
    linesIntersect?: (first: BaseLabel, second: BaseLabel) => boolean) {
    const label = labels[Math.floor(Math.random() * labels.length)];
    const oldX = label.x;
    const oldY = label.y;
    const oldEnergy = computeEnergy(label, labels);

    const [relX, relY] = moveBy ?
        moveBy(label) :
        [(Math.random() - 0.5) * MAX_MOVE_DISTANCE, (Math.random() - 0.5) * MAX_MOVE_DISTANCE];

    label.x += relX;
    label.y += relY;

    if (area) {
        if (label.x < area.x1 || label.x > area.x2) {
            label.x = oldX;
        }
        if (label.y < area.y1 || label.y > area.y2) {
            label.y = oldY;
        }
    }

    const newEnergy = computeEnergy(label, labels, linesIntersect);
    const difference = newEnergy - oldEnergy;

    if (!(Math.random() < Math.exp(-difference / currentTemp))) {
        // Reject new configuration
        label.x = oldX;
        label.y = oldY;
    }
}

function computeEnergy(label: BaseLabel, labels: Array<BaseLabel>, linesIntersect?: (first: BaseLabel, second: BaseLabel) => boolean) {
    return computeOverlapsIntersectionsEnergy(labels, linesIntersect) + computeDistanceEnergy(label);
}

function computeDistanceEnergy(label: BaseLabel) {
    const dx = label.x - label.idealX;
    const dy = label.y - label.idealY;
    const distance = Math.sqrt((dx * dx) - (dy * dy));

    return distance * LABEL_DISTANCE_WEIGHT;
}

/** Energy based on the label overlaps and count of line intersections. */
function computeOverlapsIntersectionsEnergy(labels: Array<BaseLabel>, linesIntersect?: (first: BaseLabel, second: BaseLabel) => boolean) {
    let energy = 0;

    for (let i = 0; i < labels.length; i++) {
        const firstLabel = labels[i];
        let linesIntersectCount = 0;

        for (let j = 0; j < labels.length; j++) {
            if (i === j) {
                continue;
            }

            const secondLabel = labels[j];
            const area = overlapArea(firstLabel, secondLabel);

            energy += area * LABEL_LABEL_OVERLAP_WEIGHT;

            if (linesIntersect && linesIntersect(firstLabel, secondLabel)) {
                linesIntersectCount += 1;
            }
        }

        energy += linesIntersectCount * LINES_INTERSECT_WEIGHT;
    }

    return energy;
}

function coolTemperature(initialTemp: number, currentTemp: number, sweepsCount: number) {
    return (currentTemp - (initialTemp / sweepsCount));
}