import { PointRect, Rect } from '@/dtos/Rect'

const SegmentOrientation = {
    Colinear: 'Colinear',
    Clockwise: 'Clockwise',
    AntiClockwise: 'AntiClockwise',
} as const

type SegmentOrientation = keyof typeof SegmentOrientation

/**
 * Computes the triangle area.
 * @param a First point of the triangle
 * @param b Second point of the triangle
 * @param c Third point of the triangle
 * @returns Triangle area
 */
export function triangleArea(a: [number, number], b: [number, number], c: [number, number]) {
    return Math.abs((b[0] * a[1] - a[0] * b[1]) + (c[0] * b[1] - b[0] * c[1]) + (a[0] * c[1] - c[0] * a[1])) / 2;
}

/**
 * Computes the rectangle area.
 * @param rect Rectangle
 * @returns Rectangle area
 */
export function rectArea(rect: PointRect) {
    return distance(rect.a, rect.b) * distance(rect.a, rect.d);
}

/**
 * Scales the vector to a certain length.
 * @param vec Vector
 * @param length New length of the vector
 * @returns Scaled vector
 */
export function scaleToLength(vec: [number, number], length: number): [number, number] {
    if (length < 0) {
        throw new Error('Length of a vector cannot be negative');
    }

    const [x, y] = vec;
    const oldLength = Math.sqrt((x * x) + (y * y));

    if (oldLength === 0) {
        return [x, y];
    }

    const scale = length / oldLength;
    return [x * scale, y * scale];
}

/**
 * Returns size of the overlapping area of the rectangles.
 * @param first First rectangle
 * @param second Second rectangle
 * @returns Size of the overlapping area of the rectangles
 */
export function overlapArea(first: Rect, second: Rect): number {
    const overlapWidth = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
    const overlapHeight = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
    return overlapWidth * overlapHeight;
}

/**
 * Returns a distance between two points.
 * @param first First point
 * @param second Second point
 * @returns Distance between two points
 */
export function distance(first: [number, number], second: [number, number]): number {
    const x = second[0] - first[0];
    const y = second[1] - first[1];

    return Math.sqrt(x * x + y * y);
}

/**
 * Returns whether two line segments intersect.
 * 
 * Based on:
 * - https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
 * - https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
 * 
 * @param first - First end point of the first segment
 * @param second - Second end point of the first segment
 * @param third - First end point of the second segment
 * @param fourth - Second end point of the second segment
 * @returns Boolean value expressing whether two line segments intersect
 */
export function intersect(first: [number, number], second: [number, number], third: [number, number], fourth: [number, number]): boolean {
    const o1 = orientation(first, second, third);
    const o2 = orientation(first, second, fourth);
    const o3 = orientation(third, fourth, first);
    const o4 = orientation(third, fourth, second);

    return (o1 != o2 && o3 != o4) ||
        (o1 === SegmentOrientation.Colinear && isPointOnSegment(first, second, third)) ||
        (o2 === SegmentOrientation.Colinear && isPointOnSegment(first, second, fourth)) ||
        (o3 === SegmentOrientation.Colinear && isPointOnSegment(third, fourth, first)) ||
        (o4 === SegmentOrientation.Colinear && isPointOnSegment(third, fourth, second));
}

/** Returns an oritentation of three points. */
function orientation(first: [number, number], second: [number, number], third: [number, number]): SegmentOrientation {
    const [x1, y1] = first;
    const [x2, y2] = second;
    const [x3, y3] = third;

    const val = (y2 - y1) * (x3 - x2) - (x2 - x1) * (y3 - y2);

    if (val === 0) {
        // third point lies on the line that goes through the segment formed by the first and second point
        return SegmentOrientation.Colinear;
    }
    else if (val < 0) {
        return SegmentOrientation.AntiClockwise;
    }
    else {
        return SegmentOrientation.Clockwise;
    }
}

/** Returns whether the third point lies on the segment formed by the first two points. */
function isPointOnSegment(first: [number, number], second: [number, number], third: [number, number]): boolean {
    const [x1, y1] = first;
    const [x2, y2] = second;
    const [x3, y3] = third;

    return x3 <= Math.max(x1, x2) && x3 <= Math.min(x1, x2) && (y3 <= Math.max(y1, y2) && y3 <= Math.min(y1, y2));
}