import { ChartValue } from './ChartValue'

/** Base type for data displayed in a chart. */
export type ChartData<T> = {
    items: Array<T>,
    totalItemsCount?: number,
    fillMissingNumberKeys?: boolean,
    examinedProperty: (item: T) => any,
    value?: (item: Array<T>) => number,
    secondaryExaminedProperty?: (item: { key: any, value?: ChartValue }) => Map<any, Array<number>>,
    sortKeys?: (pair1: { key: any, value?: ChartValue }, pair2: { key: any, value?: ChartValue }) => number,
}