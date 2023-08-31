import { SimpleSearchResult, SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import Pagination from './Pagination'
import { SearchParams } from '@/shared/models/SearchParams'
import { getPageFromSearchParams } from '@/shared/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/shared/constants/search'
import ListLink from '@/app/(components)/ListLink'

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
            <div className='hidden xs:block mx-2 h-full w-0.5 bg-outline'></div>
            <dt>Displayed count:</dt>
            <dd className='font-semibold'>{result.items.length}</dd>
        </dl>
    )
}

function SearchResultLink({ item }: SearchResultLinkParams) {
    return (
        <ListLink
            href={item.localUrl}
            className='my-2'>
            <span
                dangerouslySetInnerHTML={{ __html: item.title }} />
            {
                item.additionalInfo &&
                <small
                    className='text-xs text-on-surface-muted pt-1'
                    dangerouslySetInnerHTML={{ __html: item.additionalInfo }} />
            }
        </ListLink>
    )
}