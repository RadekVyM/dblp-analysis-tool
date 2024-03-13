import { ChartValue } from './ChartValue'

/** Base type for data displayed in a chart. */
export type ChartData<T> = {
    items: Array<T>,
    /** Sum of all displayed values. */
    totalItemsCount?: number,
    /** If the examined propery is integer and this property is set to true, missing numbers in the range are added. */
    fillMissingNumberKeys?: boolean,
    examinedProperty: (item: T) => any,
    /** Returns a value that should be assigned to a group of items and displayed in the graph */
    value?: (item: Array<T>) => number,
    /** Function used for sorting of the keyes (values of the examined property) */
    sortKeys?: (pair1: { key: any, value?: ChartValue }, pair2: { key: any, value?: ChartValue }) => number,
}