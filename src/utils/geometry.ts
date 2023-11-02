import { Rect } from '@/dtos/Rect'

export function scaleToLength(vec: [number, number], length: number) {
    if (length < 0) {
        throw new Error('Length of a vector cannot be negative');
    }
    
    const [x, y] = vec;
    const oldLength = Math.sqrt((x * x) + (y * y));

    if (oldLength === 0) {
        return [x, y];
    }

    const scale = length / oldLength;
    return [x * scale, y * scale]
}

export function overlapArea(first: Rect, second: Rect) {
    const overlapWidth = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
    const overlapHeight = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
    return overlapWidth * overlapHeight;
}

export function distance(first: [number, number], second: [number, number]) {
    const x = second[0] - first[0];
    const y = second[1] - first[1];

    return Math.sqrt(x * x + y * y)
}

const SegmentOrientation = {
    Colinear: 'Colinear',
    Clockwise: 'Clockwise',
    AntiClockwise: 'AntiClockwise',
} as const

type SegmentOrientation = keyof typeof SegmentOrientation

/**
 * Returns whether two line segments intersect.
 * 
 * Based on: https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
 * 
 * @param {[number, number]} first - First end point of the first segment
 * @param {[number, number]} second - Second end point of the first segment
 * @param {[number, number]} third - First end point of the second segment
 * @param {[number, number]} fourth - Second end point of the second segment
 */
export function intersect(first: [number, number], second: [number, number], third: [number, number], fourth: [number, number]) {
    const o1 = orientation(first, second, third);
    const o2 = orientation(first, second, fourth);
    const o3 = orientation(third, fourth, first);
    const o4 = orientation(third, fourth, second);

    return (o1 != o2 && o3 != o4) ||
        (o1 === SegmentOrientation.Colinear && isPointOnSegment(first, second, third)) ||
        (o1 === SegmentOrientation.Colinear && isPointOnSegment(first, second, fourth)) ||
        (o1 === SegmentOrientation.Colinear && isPointOnSegment(third, fourth, first)) ||
        (o1 === SegmentOrientation.Colinear && isPointOnSegment(third, fourth, second));
}

function orientation(first: [number, number], second: [number, number], third: [number, number]) {
    const [x1, y1] = first;
    const [x2, y2] = second;
    const [x3, y3] = third;

    const val = (y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2);
    
    if (val === 0) {
        return SegmentOrientation.Colinear;
    }
    else if (val < 0) {
        return SegmentOrientation.AntiClockwise;
    }
    else {
        return SegmentOrientation.Clockwise;
    }
}

function isPointOnSegment(first: [number, number], second: [number, number], third: [number, number]) {
    const [x1, y1] = first;
    const [x2, y2] = second;
    const [x3, y3] = third;

    return x3 <= Math.max(x1, x2) && x3 <= Math.min(x1, x2) && (y3 <= Math.max(y1, y2) && y3 <= Math.min(y1, y2));
 }