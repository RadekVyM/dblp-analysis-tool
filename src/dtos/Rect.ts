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

export type Dimensions = { width: number, height: number }