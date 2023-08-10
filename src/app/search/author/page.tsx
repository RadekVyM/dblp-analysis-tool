import { DblpAuthorSearchHit, DblpAuthorSearchHitNote, DblpSearchResult } from '@/shared/dtos/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import { queryAuthors } from '@/shared/fetching/authors'
import { getPageFromParams, searchToItemsParams } from '../(components)/params'
import Pagination from '../(components)/Pagination'
import { ItemsParams } from '@/shared/fetching/fetching'
import { SimpleSearchResult } from '@/shared/dtos/SimpleSearchResult'
import AuthorSearchResultLink from './(components)/AuthorSearchResultLink'

type SearchAuthorPageParams = {
    searchParams: any
}

export default async function SearchAuthorPage({ searchParams }: SearchAuthorPageParams) {
    const params = searchToItemsParams(searchParams);
    const result = await getSearchResult(params);

    return (
        <>
            <ul
                className='mb-6'>
                {result.items.map((author) =>
                    <li
                        key={author.url}>
                        <AuthorSearchResultLink
                            author={author} />
                    </li>)}
            </ul>
            <Pagination
                total={result.totalCount}
                currentPage={getPageFromParams(searchParams)}
                url='/search/author'
                searchParams={searchParams} />
        </>
    )
}

async function getSearchResult(params: ItemsParams) {
    return await getSearchResultWithQuery(params);
}

async function getSearchResultWithQuery(params: ItemsParams) {
    const response = await queryAuthors(params);
    const authors = new DblpSearchResult<DblpAuthorSearchHit>(response, SearchType.Author);
    const result = new SimpleSearchResult(
        Math.min(authors.hits.total, 10000),
        authors.hits.items.map((item) => {
            return {
                title: item.info.author,
                url: item.info.localUrl,
                additionalInfo: getAdditionalInfo(item.info)
            }
        }));

    return result;
}

async function getSearchResultWithoutQuery(params: ItemsParams) {
    // TODO: this will return an array of items that will conatain their original urls fetched from dblp 
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