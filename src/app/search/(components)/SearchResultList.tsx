import { SimpleSearchResult, SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import Pagination from './Pagination'
import { SearchParams } from '@/shared/models/SearchParams'
import Link from 'next/link'
import { getPageFromSearchParams } from '@/shared/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/shared/constants/search'

type SearchResultListParams = {
    result: SimpleSearchResult,
    searchParams: SearchParams,
    paginationUrl: string
}

type ResultStatsParams = {
    result: SimpleSearchResult
}

type SearchResultLinkParams = {
    item: SimpleSearchResultItem
}

export default function SearchResultList({ result, searchParams, paginationUrl }: SearchResultListParams) {
    return (
        <>
            {
                result &&
                <ResultStats
                    result={result} />
            }

            <ul
                className='flex-1 my-8'>
                {result.items.map((item) =>
                    <li
                        key={`${item.title}${item.localUrl}`}>
                        <SearchResultLink
                            item={item} />
                    </li>)}
            </ul>
            {
                result.totalCount > DEFAULT_ITEMS_COUNT_PER_PAGE &&
                <Pagination
                    className='self-center mb-8'
                    total={result.totalCount}
                    currentPage={getPageFromSearchParams(searchParams)}
                    url={paginationUrl}
                    searchParams={searchParams} />
            }
        </>
    )
}

function ResultStats({ result }: ResultStatsParams) {
    return (
        <dl
            className='flex flex-col xs:flex-row xs:items-center text-sm gap-1'>
            <dt>Total count:</dt>
            <dd className='font-semibold'>{result.totalCount.toLocaleString(undefined, { useGrouping: true })}</dd>
            <div className='hidden xs:block mx-2 h-full w-0.5 bg-gray-400 dark:bg-gray-500'></div>
            <dt>Displayed count:</dt>
            <dd className='font-semibold'>{result.items.length}</dd>
        </dl>
    )
}

function SearchResultLink({ item }: SearchResultLinkParams) {
    return (
        <Link
            href={item.localUrl}
            className='
                relative flex flex-col px-3 py-2 my-2 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition-colors
                hover:before:content-[""] hover:before:block hover:before:absolute hover:before:left-0 hover:before:top-1/2 hover:before:translate-y-[-50%]
                hover:before:bg-accent hover:before:w-1 hover:before:h-4 hover:before:rounded-sm'>
            <span
                dangerouslySetInnerHTML={{ __html: item.title }} />
            {
                item.additionalInfo &&
                <small
                    className='text-xs text-gray-500 dark:text-gray-400 pt-1'
                    dangerouslySetInnerHTML={{ __html: item.additionalInfo }} />
            }
        </Link>
    )
}