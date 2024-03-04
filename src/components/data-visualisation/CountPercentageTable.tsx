'use client'

import Table, { TableData } from '@/components/data-visualisation/Table'
import { useMemo } from 'react'

type CountPercentageTableParams = {
    filter: (item: any, examinedValue: any) => boolean,
    toPresentedContent: (examinedValue: any) => string,
    rowKey?: (examinedValue: any) => string,
    /** Returns count of items in a group. */
    itemsCount?: (filteredItems: Array<any>) => number,
    sortExaminedValue?: (first: TableData, second: TableData) => number,
    items: Array<any>,
    examinedValues: Array<any>,
    examinedValueTitle: string,
    examinedValueSortTitle: string,
    hideFooter?: boolean,
    totalCount?: number
}

/** Table that groups items by a property and displays counts of the items in the groups. */
export default function CountPercentageTable({ items, examinedValues, examinedValueTitle, examinedValueSortTitle, totalCount, hideFooter, itemsCount, sortExaminedValue, filter, toPresentedContent, rowKey }: CountPercentageTableParams) {
    const rows = useMemo(() =>
        examinedValues.map((examinedValue, index) => {
            const filteredItems = items.filter((item) => filter(item, examinedValue));
            const count = itemsCount ? itemsCount(filteredItems) : filteredItems.length;
            const percentage = count / (totalCount || items.length);

            return [
                { value: examinedValue, presentedContent: toPresentedContent(examinedValue) },
                { value: count, presentedContent: count },
                { value: percentage, presentedContent: percentage.toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
            ];
        }),
        [examinedValues, items, totalCount, itemsCount, toPresentedContent, filter]);
    const footer = [
        { value: 'Totals', presentedContent: 'Totals' },
        { value: totalCount || items.length, presentedContent: totalCount || items.length },
        { value: 1, presentedContent: (1).toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
    ];

    return (
        <Table
            className='h-full'
            rowKey={rowKey ? ((row) => rowKey(row[0].value)) : undefined}
            rows={rows}
            columnHeaders={[
                {
                    column: 0,
                    sortingTitle: examinedValueSortTitle,
                    title: examinedValueTitle,
                    className: 'w-[20rem]',
                    sort: sortExaminedValue
                },
                {
                    column: 1,
                    sortingTitle: 'Sort by count',
                    title: 'Count'
                },
                {
                    column: 2,
                    sortingTitle: 'Sort by percentage',
                    title: 'Percentage'
                }
            ]}
            footer={hideFooter ? undefined : footer}
            isFirstColumnHeader />
    )
}