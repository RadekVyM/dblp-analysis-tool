'use client'

import Table, { TableData } from '@/components/data-visualisation/Table'
import { useMemo } from 'react'

type CountPercentageTableParams = {
    filter: (item: any, examinatedValue: any) => boolean,
    toPresentedContent: (examinatedValue: any) => string,
    rowKey?: (examinedValue: any) => string,
    sortExaminedValue?: (first: TableData, second: TableData) => number
    items: Array<any>,
    examinatedValues: Array<any>,
    examinatedValueTitle: string,
    examinatedValueSortTitle: string
}

export default function CountPercentageTable({ items, examinatedValues, examinatedValueTitle, examinatedValueSortTitle, sortExaminedValue, filter, toPresentedContent, rowKey }: CountPercentageTableParams) {
    const rows = useMemo(() =>
        examinatedValues.map((examinatedValue, index) => {
            const count = items.filter((item) => filter(item, examinatedValue)).length;
            const percentage = count / items.length;

            return [
                { value: examinatedValue, presentedContent: toPresentedContent(examinatedValue) },
                { value: count, presentedContent: count },
                { value: percentage, presentedContent: percentage.toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
            ]
        }),
        [examinatedValues, items, toPresentedContent, filter]);
    const footer = [
        { value: 'Totals', presentedContent: 'Totals' },
        { value: items.length, presentedContent: items.length },
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
                    sortingTitle: examinatedValueSortTitle,
                    title: examinatedValueTitle,
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
            footer={footer}
            isFirstColumnHeader />
    )
}