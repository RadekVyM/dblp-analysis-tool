/** Base type for data that are displayed in a chart. */
export type ChartData<T> = {
    items: Array<T>
    fillMissingNumberKeys?: boolean,
    examinedProperty: (item: T) => any,
    sortKeys?: (key1: any, key2: any) => number,
}