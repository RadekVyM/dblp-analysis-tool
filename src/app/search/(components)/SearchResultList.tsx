import { SimpleSearchResult, SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import Pagination from './Pagination'
import { SearchParams } from '@/shared/models/SearchParams'
import { getPageFromSearchParams } from '@/shared/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/shared/constants/search'
import ListLink from '@/app/(components)/ListLink'
import ItemsStats from '@/app/(components)/ItemsStats'

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
        <ItemsStats
            totalCount={result.totalCount}
            displayedCount={result.items.length} />
    )
}

function SearchResultLink({ item }: SearchResultLinkParams) {
    return (
        <ListLink
            href={item.localUrl}
            className='my-2'
            prefetch={false}>
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