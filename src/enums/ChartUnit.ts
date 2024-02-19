/** Unit in which chart values are displayed. */
export const ChartUnit = {
    Count: 'Count',
    Percentage: 'Percentage'
} as const;

/** Unit in which chart values are displayed. */
export type ChartUnit = keyof typeof ChartUnit