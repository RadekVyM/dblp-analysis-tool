'use client'

import { urlWithParams } from '@/utils/urls'
import Button from '@/components/Button'
import { cn } from '@/utils/tailwindUtils'
import { MdChevronLeft, MdChevronRight, MdSkipNext, MdSkipPrevious } from 'react-icons/md'
import { repeat } from '@/utils/numbers'
import { useElementSize } from 'usehooks-ts'
import { useEffect, useState } from 'react'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/constants/search'

type PaginationParams = {
    className?: string,
    total: number,
    currentPage: number,
    url: string,
    searchParams: { [key: string]: any }
}

type PaginationLinkParams = {
    url: string,
    children: React.ReactNode,
    before?: React.ReactNode,
    after?: React.ReactNode,
    title?: string,
    isSelected?: boolean
}

const COLS_GRID = 'grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)]';

export default function Pagination({ total, currentPage, url, searchParams, className }: PaginationParams) {
    const pageCount = Math.ceil(total / DEFAULT_ITEMS_COUNT_PER_PAGE);
    const pages = getAroundCurrentPages(currentPage, pageCount);
    const left = getLeftSkipPages(currentPage);
    const right = getRightSkipPages(currentPage, pageCount);

    const [gridCols, setGridCols] = useState(COLS_GRID);

    const [outerContainerRef, outerContainerSize] = useElementSize();
    const [leftListRef, leftListSize] = useElementSize<HTMLUListElement>();
    const [centerListRef, centerListSize] = useElementSize<HTMLUListElement>();
    const [rightListRef, rightListSize] = useElementSize<HTMLUListElement>();

    useEffect(() => {
        if (Math.max(leftListSize.width, rightListSize.width) * 2 + centerListSize.width > outerContainerSize.width) {
            setGridCols('');
        }
        else {
            setGridCols(COLS_GRID);
        }
    }, [outerContainerSize.width, leftListSize.width, centerListSize.width, rightListSize.width]);

    return (
        <div
            ref={outerContainerRef}
            className='grid place-content-center w-full'>
            <nav
                className={cn('grid gap-y-5 max-w-full overflow-clip', className, gridCols)}>
                <div
                    className='grid'>
                    <ul
                        ref={leftListRef}
                        className='flex gap-1 justify-self-start w-fit pr-2'>
                        {left.map((page, index) =>
                            <PaginationLink
                                key={page}
                                title={`Go to page ${page}`}
                                url={urlWithParams(url, withPage(searchParams, page))}>
                                {
                                    page === 1 ?
                                        <MdSkipPrevious /> :
                                        <div
                                            className='flex -mx-0.5'>
                                            {
                                                repeat(left.length - index, (i) =>
                                                    <MdChevronLeft
                                                        key={`${url}--${i}`}
                                                        className={i != 0 ? '-ml-2' : ''} />)
                                            }
                                        </div>
                                }
                            </PaginationLink>
                        )}
                    </ul>
                </div>

                <ul
                    ref={centerListRef}
                    className='justify-self-center flex flex-wrap justify-center gap-1 px-2 w-fit'>
                    {pages.map((page) =>
                        <PaginationLink
                            key={page}
                            title={`Go to page ${page}`}
                            url={urlWithParams(url, withPage(searchParams, page))}
                            isSelected={page === currentPage}>
                            {page}
                        </PaginationLink>
                    )}
                </ul>

                <div
                    className='grid'>
                    <ul
                        ref={rightListRef}
                        className='flex gap-1 justify-self-end w-fit pl-2'>
                        {right.map((page, index) =>
                            <PaginationLink
                                key={page}
                                title={`Go to page ${page}`}
                                url={urlWithParams(url, withPage(searchParams, page))}>
                                {
                                    page === pageCount ?
                                        <MdSkipNext /> :
                                        <div
                                            className='flex -mx-0.5'>
                                            {
                                                repeat(index + 1, (i) =>
                                                    <MdChevronRight
                                                        key={`${url}--${i}`}
                                                        className={i != 0 ? '-ml-2' : ''} />)
                                            }
                                        </div>
                                }
                            </PaginationLink>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    )
}

function PaginationLink({ url, children, isSelected, after, before, title }: PaginationLinkParams) {
    return (
        <li
            key={url}
            className='flex'>
            {before}
            <Button
                title={title}
                variant={isSelected ? 'default' : 'outline'} size='xs'
                href={url}>
                {children}
            </Button>
            {after}
        </li>
    )
}

function withPage(params: { [key: string]: any }, page: number) {
    const copy = JSON.parse(JSON.stringify(params));
    copy['page'] = page;

    return copy;
}

function getAroundCurrentPages(currentPage: number, totalCount: number) {
    const numbers: Array<number> = [];
    const first = Math.max(currentPage + 2 > totalCount ? totalCount - 4 : currentPage - 2, 1);

    for (let i = 0; i < Math.min(totalCount, 5); i++) {
        numbers.push(first + i);
    }

    return numbers;
}

function getLeftSkipPages(currentPage: number) {
    const numbers: Array<number> = [];

    for (let i = 10; currentPage - i > 1 && i <= 10000; i *= 10) {
        numbers.push(currentPage - i);
    }

    if (currentPage != 1) {
        numbers.push(1);
    }

    return numbers.reverse();
}

function getRightSkipPages(currentPage: number, totalCount: number) {
    const numbers: Array<number> = [];

    for (let i = 10; currentPage + i < totalCount && i <= 10000; i *= 10) {
        numbers.push(currentPage + i);
    }

    if (currentPage != totalCount) {
        numbers.push(totalCount);
    }

    return numbers;
}
