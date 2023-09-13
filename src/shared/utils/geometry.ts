type AreaObject = {
    x: number,
    y: number,
    width: number,
    height: number,
}

export function scaleToLength(vec: [number, number], length: number) {
    const [x, y] = vec;
    const oldLength = Math.sqrt((x * x) + (y * y));
    const scale = length / oldLength;
    return [x * scale, y * scale]
}

export function overlapArea(first: AreaObject, second: AreaObject) {
    const overlapWidth = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
    const overlapHeight = Math.max(0, Math.min(first.y + first.width, second.y + second.width) - Math.max(first.y, second.y));
    return overlapWidth * overlapHeight;
}

// Based on: https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
export function intersect(first: [number, number], second: [number, number], third: [number, number], fourth: [number, number]) {
    const o1 = orientation(first, second, third);
    const o2 = orientation(first, second, fourth);
    const o3 = orientation(third, fourth, first);
    const o4 = orientation(third, fourth, second);

    return o1 != o2 && o3 != o4
}

function orientation(first: [number, number], second: [number, number], third: [number, number])
{
    const [x1, y1] = first;
    const [x2, y2] = second;
    const [x3, y3] = third;

    const val = (y2 - y1) * (x3 - x2) - (x2 - x1) * (x3 - y2);
    
    return val > 0 // clock or counterclock wise
}