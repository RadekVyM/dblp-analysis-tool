import { ChartValue } from "./ChartValue"

/** Base type for data that are displayed in a chart. */
export type ChartData<T> = {
    items: Array<T>
    fillMissingNumberKeys?: boolean,
    examinedProperty: (item: T) => any,
    sortKeys?: (pair1: { key: any, value?: ChartValue }, pair2: { key: any, value?: ChartValue }) => number,
}