/** Orientation of a chart. */
export const ChartOrientation = {
    Horizontal: 'Horizontal',
    Vertical: 'Vertical'
} as const;

/** Orientation of a chart. */
export type ChartOrientation = keyof typeof ChartOrientation