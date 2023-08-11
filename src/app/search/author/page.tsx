import { BaseDblpSearchHit, DblpAuthorSearchHit, DblpAuthorSearchHitNote, DblpSearchResult } from '@/shared/dtos/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import { queryAuthors } from '@/shared/fetching/authors'
import { ITEMS_COUNT_PER_PAGE, getPageFromParams, searchToItemsParams } from '../(components)/params'
import Pagination from '../(components)/Pagination'
import { ItemsParams } from '@/shared/fetching/fetching'
import { SimpleSearchResult } from '@/shared/dtos/SimpleSearchResult'
import AuthorSearchResultLink from './(components)/AuthorSearchResultLink'
import { fetchAuthorsIndex, fetchAuthorsIndexLength } from '@/server/fetching/authors'

type SearchAuthorPageParams = {
    searchParams: any
}

export default async function SearchAuthorPage({ searchParams }: SearchAuthorPageParams) {
    const params = searchToItemsParams(searchParams);
    const result = await getSearchResult(params);

    return (
        <>
            {
                result &&
                <dl
                    className='flex items-center text-sm gap-1'>
                    <dt>Total count:</dt>
                    <dd className='font-semibold'>{result.totalCount.toLocaleString(undefined, { useGrouping: true })}</dd>
                    <div className='mx-2 h-full w-0.5 bg-gray-400 dark:bg-gray-500'></div>
                    <dt>Displayed count:</dt>
                    <dd className='font-semibold'>{result.items.length}</dd>
                </dl>
            }

            <ul
                className='flex-1 my-8'>
                {result.items.map((author) =>
                    <li
                        key={author.localUrl}>
                        <AuthorSearchResultLink
                            author={author} />
                    </li>)}
            </ul>
            {
                result.totalCount > ITEMS_COUNT_PER_PAGE &&
                <Pagination
                    className='self-center mb-8'
                    total={result.totalCount}
                    currentPage={getPageFromParams(searchParams)}
                    url='/search/author'
                    searchParams={searchParams} />
            }
        </>
    )
}

async function getSearchResult(params: ItemsParams) {
    if (params.query && params.query.length > 0) {
        return await getSearchResultWithQuery(params);
    }
    else {
        return await getSearchResultWithoutQuery(params);
    }
}

async function getSearchResultWithQuery(params: ItemsParams) {
    const response = await queryAuthors(params);
    const authors = new DblpSearchResult<DblpAuthorSearchHit>(response, SearchType.Author);
    const count = Math.min(authors.hits.total, 10000);
    const result = new SimpleSearchResult(
        count,
        authors.hits.items.map((item) => {
            return {
                title: item.info.author,
                localUrl: item.info.localUrl,
                additionalInfo: getAdditionalInfo(item.info)
            }
        }));

    return result;
}

async function getSearchResultWithoutQuery(params: ItemsParams) {
    // TODO: this will return an array of items that will conatain their original urls fetched from dblp

    const authors = await fetchAuthorsIndex({ first: params.first, count: ITEMS_COUNT_PER_PAGE });
    const count = await fetchAuthorsIndexLength();
    const result = new SimpleSearchResult(
        count,
        authors);

    return result;
}

function getAdditionalInfo(author: DblpAuthorSearchHit) {
    if (!author.notes || !author.notes?.note) {
        return undefined;
    }

    if ('text' in author.notes.note) {
        const note = author.notes?.note as DblpAuthorSearchHitNote;
        return note?.text || undefined;
    }
    else {
        const notes = author.notes?.note as Array<DblpAuthorSearchHitNote>;
        return notes
            .map((n) => n['@type'] == 'award' ? undefined : n.text)
            .filter((t) => t)
            .join('<br/>');
    }
}