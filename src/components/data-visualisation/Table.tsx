'use client'

import useLazyListCount from '@/hooks/useLazyListCount'
import { isGreater } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { MdArrowDropDown, MdArrowDropUp, MdInfo } from 'react-icons/md'

type TableParams = {
    className?: string,
    rows: Array<Array<TableData>>,
    columnHeaders: Array<TableColumnHeader>,
    footer?: Array<TableData>,
    isFirstColumnHeader?: boolean,
    rowKey?: (rowValues: Array<any>) => string
}

type SortButtonParams = {
    onClick: () => void,
    title: string,
    descending: boolean | undefined
}

type TableColumnHeaderParams = {
    className?: string,
    info?: string,
    sortingTitle: string,
    children: React.ReactNode,
    column: TableColumn,
    currentSorting: TableColumnItemsOrder | undefined,
    updateSorting: (column: TableColumn) => void,
}

type TableColumnItemsOrder = {
    column: number,
    descending: boolean
}

type TableColumn = number

export type TableColumnHeader = {
    column: TableColumn,
    title: React.ReactNode,
    sortingTitle: string,
    info?: string,
    className?: string,
    sort?: (first: TableData, second: TableData) => number
}

export type TableData = {
    value: any,
    presentedContent: React.ReactNode
}

const DISPLAYED_COUNT_INCREASE = 50

/** Table component that allows sorting of columns. */
export default function Table({ rows, columnHeaders, footer, className, isFirstColumnHeader, rowKey }: TableParams) {
    const { displayedSortedRows, sorting, observerTarget, scrollableElement, updateSorting } = useDisplayedSortedRows(rows, columnHeaders);

    return (
        <div
            ref={scrollableElement}
            className={cn('grid content-stretch overflow-auto', className)}>
            <table
                className='border-collapse table-auto'>
                <thead
                    className='sticky top-0'>
                    <tr
                        className='border-b border-outline bg-surface-container'>
                        {columnHeaders.map((header) =>
                            <TableColumnHeader
                                key={header.column}
                                className={header.className}
                                column={header.column}
                                sortingTitle={header.sortingTitle}
                                info={header.info}
                                currentSorting={sorting}
                                updateSorting={updateSorting}>
                                {header.title}
                            </TableColumnHeader>)}
                    </tr>
                </thead>
                <tbody>
                    {displayedSortedRows.map((row, index) => {
                        return (
                            <tr
                                key={`row-${rowKey ? rowKey(row) : row.map(d => d.value).join('-')}`}
                                className={index % 2 === 0 ? ' bg-surface-dim-container' : ''}>
                                {row.map((col, index) => isFirstColumnHeader && index === 0 ?
                                    <th key={`row-value-${index}`} scope='row' className='text-start px-3 py-2 text-sm'>{col.presentedContent}</th> :
                                    <td key={`row-value-${index}`} className='px-3 py-2 border-l border-outline'>{col.presentedContent}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
                {
                    footer &&
                    <tfoot>
                        <tr
                            className='border-t border-outline bg-surface-container'>
                            {footer.map((col, index) => isFirstColumnHeader && index === 0 ?
                                <th key={`footer-value-${index}`} scope='row' className='text-start px-3 py-2 text-sm'>{col.presentedContent}</th> :
                                <td key={`footer-value-${index}`} className='px-3 py-2 font-bold'>{col.presentedContent}</td>)}
                        </tr>
                    </tfoot>
                }
            </table>

            <div
                className='h-[1px]'
                ref={observerTarget}
                aria-hidden />
        </div>
    )
}


function TableColumnHeader({ className, column, sortingTitle, children, currentSorting, info, updateSorting }: TableColumnHeaderParams) {
    return (
        <th scope='col' className={cn('text-start px-3 py-2', className)}>
            <div className='flex gap-2 items-center'>
                <span>{children}</span> {info && <MdInfo className='inline' title={info} />}
                <SortButton
                    title={sortingTitle}
                    onClick={() => updateSorting(column)}
                    descending={currentSorting?.column === column ? currentSorting.descending : undefined} />
            </div>
        </th>
    )
}

function SortButton({ onClick, descending, title }: SortButtonParams) {
    return (
        <button
            title={title}
            onClick={onClick}
            className='flex flex-col items-center justify-center px-1 rounded-md bg-surface-container hover:bg-surface-dim-container text-on-surface-container-muted'>
            <MdArrowDropUp
                className={cn('mb-[-0.25rem] scale-125', descending === true ? 'text-on-surface-container scale-150' : '')} />
            <MdArrowDropDown
                className={cn('mt-[-0.25rem] scale-125', descending === false ? 'text-on-surface-container scale-150' : '')} />
        </button>
    )
}

/** Hook that manages dislayed rows and their sorting in a table. */
function useDisplayedSortedRows(rows: Array<Array<TableData>>, columnHeaders: Array<TableColumnHeader>) {
    const [sortedRows, setSortedRows] = useState<Array<Array<any>>>([]);
    const [sorting, setSorting] = useState<TableColumnItemsOrder | undefined>(undefined);
    const observerTarget = useRef<HTMLDivElement>(null);
    const scrollableElement = useRef<HTMLDivElement>(null);
    const [displayedCount, resetDisplayedCount] = useLazyListCount(rows.length, DISPLAYED_COUNT_INCREASE, observerTarget);
    const displayedSortedRows = useMemo(() => sortedRows.slice(0, displayedCount), [sortedRows, displayedCount]);

    useEffect(() => {
        const newRows = [...rows];

        newRows.sort((first, second) => {
            if (!sorting) {
                return 0;
            }

            const factor = sorting.descending ? 1 : -1;
            const sort = columnHeaders[sorting.column].sort;

            if (sort) {
                return sort(first[sorting.column], second[sorting.column]) * factor;
            }
            return isGreater(first[sorting.column].value, second[sorting.column].value) * factor;
        });

        setSortedRows(newRows);
        resetDisplayedCount();
        scrollableElement.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [rows, columnHeaders, sorting]);

    const updateSorting = useCallback((column: TableColumn) => {
        if (sorting && sorting.column === column) {
            if (!sorting.descending) {
                setSorting({ column: column, descending: true });
            }
            else {
                setSorting(undefined);
            }
        }
        else {
            setSorting({ column: column, descending: false });
        }
    }, [sorting]);

    return {
        displayedSortedRows,
        observerTarget,
        scrollableElement,
        sorting,
        updateSorting,
    };
}