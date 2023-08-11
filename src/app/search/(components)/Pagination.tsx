import { urlWithParams } from '@/shared/utils/urls'
import { ITEMS_COUNT_PER_PAGE } from './params'
import { clamp } from '@/shared/utils/numbers'
import Button from '@/app/(components)/Button'

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
    isSelected?: boolean
}

export default async function Pagination({ total, currentPage, url, searchParams, className }: PaginationParams) {
    const pageCount = Math.ceil(total / ITEMS_COUNT_PER_PAGE);
    const pages: Array<number> = [];

    for (let i = currentPage; (i < currentPage + 5) && (i <= pageCount); i++) {
        pages.push(i);
    }

    return (
        <nav
            className={className}>
            <ul
                className='flex'>
                <PaginationLink
                    url={urlWithParams(url, withPage(searchParams, clamp(currentPage - 1, 1, pageCount)))}>
                    {'<'}
                </PaginationLink>

                {
                    pages[0] != 1 &&
                    <PaginationLink
                        url={urlWithParams(url, withPage(searchParams, 1))}
                        after={<span>...</span>}>
                        {1}
                    </PaginationLink>
                }

                {pages.map((page) =>
                    <PaginationLink
                        url={urlWithParams(url, withPage(searchParams, page))}
                        isSelected={page == currentPage}>
                        {page}
                    </PaginationLink>
                )}

                {
                    pages[pages.length - 1] != pageCount &&
                    <PaginationLink
                        url={urlWithParams(url, withPage(searchParams, pageCount))}>
                        {pageCount}
                    </PaginationLink>
                }

                <PaginationLink
                    url={urlWithParams(url, withPage(searchParams, clamp(currentPage + 1, 1, pageCount)))}>
                    {'>'}
                </PaginationLink>
            </ul>
        </nav>
    )
}

function PaginationLink({ url, children, isSelected, after, before }: PaginationLinkParams) {
    return (
        <li
            className='flex'>
            {before}
            <Button
                variant={isSelected ? 'default' : 'outline'} size='sm'
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