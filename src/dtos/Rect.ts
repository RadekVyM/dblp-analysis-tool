export type Rect = {
    x: number,
    y: number,
} & Dimensions

export type EdgeRect = {
    left: number,
    top: number,
    right: number,
    bottom: number,
}

export type PointRect = {
    a: [number, number],
    b: [number, number],
    c: [number, number],
    d: [number, number],
}

export type Dimensions = { width: number, height: number }