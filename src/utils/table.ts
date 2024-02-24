import { TableData } from '@/components/data-visualisation/Table'
import { isSmaller } from './array'

/**
 * Returns whether the presented content of one table item is smaller than another one.
 * @param first First table item
 * @param second Second table item
 * @returns 1 if the first value is smaller, 0 if they are equal and -1 otherwise
 */
export function sortByPresentedContent(first: TableData, second: TableData): number {
    return isSmaller(first.presentedContent, second.presentedContent);
}