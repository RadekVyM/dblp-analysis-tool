import { Rect } from '@/models/Rect'
import { distance, intersect, overlapArea, scaleToLength } from '@/utils/geometry'
import { describe, expect, test } from '@jest/globals'

type ScaleToLengthValue = [
    inputVec: [x: number, y: number], length: number, expectedVec: [x: number, y: number]
]

type OverlapAreaValue = [
    firstRect: Rect, secondRect: Rect, expectedArea: number
]

type DistanceValue = [
    firstPoint: [x: number, y: number], secondPoint: [x: number, y: number], expectedDistance: number
]

type IntersectValue = [
    firstPoint: [x: number, y: number], secondPoint: [x: number, y: number], thirdPoint: [x: number, y: number], fourthPoint: [x: number, y: number]
]

describe('scaleToLength function', () => {
    const values: Array<ScaleToLengthValue> = [
        [[0, 0], 1, [0, 0]],
        [[0, 0], 2, [0, 0]],
        [[0, 1], 2, [0, 2]],
        [[1, 0], 3, [3, 0]],
        [[3, 4], 10, [6, 8]],
        [[-3, 4], 10, [-6, 8]],
        [[3, -4], 10, [6, -8]],
        [[-3, -4], 10, [-6, -8]],
        [[-3, -4], 2.5, [-1.5, -2]],
        [[10, 20], 0, [0, 0]],
    ];

    for (const [inputVec, length, expectedVec] of values) {
        test(`scale [${inputVec}] to ${length}`, () => {
            expect(scaleToLength(inputVec, length)).toEqual(expectedVec);
        });
    }

    test('negative length should throw an exception', () => {
        expect(() => scaleToLength([1, 2], -10)).toThrow();
    });
});

describe('overlapArea function', () => {
    const values: Array<OverlapAreaValue> = [
        [{x: 0, y: 0, width: 0, height: 0}, {x: 0, y: 0, width: 0, height: 0}, 0],
        [{x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 0, height: 0}, 0],
        [{x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 10, height: 10}, 100],
        [{x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}, 10000],
        [{x: -100, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}, 0],
        [{x: 0, y: -100, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}, 0],
        [{x: -100, y: -100, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}, 0],
        [{x: -200, y: -200, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}, 0],
        [{x: 100, y: 100, width: 200, height: 200}, {x: 0, y: 0, width: 200, height: 200}, 10000],
        [{x: 100, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 200, height: 100}, 10000],
        [{x: 0, y: 100, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 200}, 10000],
        [{x: 0, y: 50, width: 10, height: 10}, {x: 0, y: 0, width: 100, height: 200}, 100],
    ];

    for (const [firstRect, secondRect, expectedArea] of values) {
        test(`overlap area of ${rectToString(firstRect)} and ${rectToString(secondRect)} is ${expectedArea}`, () => {
            expect(overlapArea(firstRect, secondRect)).toBe(expectedArea);
        });
    }
});

describe('distance function', () => {
    const values: Array<DistanceValue> = [
        [[0, 0], [0, 0], 0],
        [[1, 1], [1, 1], 0],
        [[-1, 1], [-1, 1], 0],
        [[1, -1], [1, -1], 0],
        [[-1, -1], [-1, -1], 0],
        [[0, 0], [3, 4], 5],
        [[3, 4], [0, 0], 5],
        [[-3, 4], [0, 0], 5],
        [[3, -4], [0, 0], 5],
        [[-3, -4], [0, 0], 5],
    ];

    for (const [firstPoint, secondPoint, expectedDistance] of values) {
        test(`distance between [${firstPoint}] and [${secondPoint}] is ${expectedDistance}`, () => {
            expect(distance(firstPoint, secondPoint)).toBe(expectedDistance);
        });
    }
});

describe('intersect function', () => {
    const truthyValues: Array<IntersectValue> = [
        [[0, 0], [1, 1], [0, 1], [1, 0]],
        [[1, 1], [0, 0], [1, 0], [0, 1]],
        [[-1, 0], [1, 0], [0, -1], [0, 1]],
        // An end point of one segment lies on the other segment
        [[0, 0], [0, 0], [0, 0], [0, 0]],
        [[1, 0], [0, 0], [0, 0], [0, 0]],
        [[1, 0], [0, 0], [0, 0], [0, 1]],
        [[1, 0], [-1, 0], [0, 0], [0, 1]],
        [[0, 0], [2, 2], [1, 1], [2, 0]],
        // Colinear intersecting
        [[1, 0], [0, 0], [0, 0], [1, 0]],
        [[2, 0], [0, 0], [-1, 0], [1, 0]],
    ];

    const falsyValues: Array<IntersectValue> = [
        // Colinear
        [[1, 0], [0, 0], [0, 1], [1, 1]],
    ];

    for (const [firstPoint, secondPoint, thirdPoint, fourthPoint] of truthyValues) {
        test(`[[${firstPoint}], [${secondPoint}]] and [[${thirdPoint}], [${fourthPoint}]] intersect`, () => {
            expect(intersect(firstPoint, secondPoint, thirdPoint, fourthPoint)).toBeTruthy();
        });
    }
    
    for (const [firstPoint, secondPoint, thirdPoint, fourthPoint] of falsyValues) {
        test(`[[${firstPoint}], [${secondPoint}]] and [[${thirdPoint}], [${fourthPoint}]] do not intersect`, () => {
            expect(intersect(firstPoint, secondPoint, thirdPoint, fourthPoint)).toBeFalsy();
        });
    }
});

function rectToString(rect: Rect) {
    return `{ x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}}`
}