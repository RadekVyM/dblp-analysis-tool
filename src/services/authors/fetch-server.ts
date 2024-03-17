import 'server-only'
import { fetchXml, withCache } from '@/services/fetch'
import { fetchItemsIndexHtml } from '@/services/items/fetch'
import { DBLP_AUTHORS_INDEX_HTML, DBLP_URL } from '@/constants/urls'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { BaseSearchItemsParams, SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { extractAuthor, extractAuthorsIndex, extractAuthorsIndexLength } from './parsing'
import { SimpleSearchResult, SimpleSearchResultItem, createSimpleSearchResult } from '@/dtos/search/SimpleSearchResult'
import { cacheRecord, tryGetCachedRecord } from '../cache/cache'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import waitForNextFetch from '../waitForNextFetch'
import { delay } from '@/utils/promises'

/**
 * Requests all the author information with a specified ID.
 * Results are cached.
 * @param id Normalized ID of the author
 * @returns Object containing all the author information
 */
export async function fetchAuthor(id: string, signal?: AbortSignal): Promise<DblpAuthor> {
    return await withCache<DblpAuthor>(
        async (value: DblpAuthor) => await cacheRecord(id, value),
        async () => await tryGetCachedRecord(id),
        async () => {
            await waitForNextFetch(signal);
            const xml = await fetchAuthorXml(id);
            return extractAuthor(xml, id);
        }
    );
}

/**
 * Requests a part of the authors index and returns its entire length.
 * It is not possible to search by an author's name.
 * 
 * @param params Parameters which affect what items are returned
 * @param itemsCount Max number of authors that can be returned
 * @returns Processed search result containg a list of found authors
 */
export async function fetchSearchResultWithoutQuery(
    params: SearchItemsParams,
    itemsCount: number
): Promise<SimpleSearchResult> {
    try {
        await waitForNextFetch();
        const authors = await fetchAuthorsIndex({ first: params.first, count: itemsCount });
        await delay(500); // Wait at least a bit to not send multiple requests at the same time
        const count = await fetchAuthorsIndexLength();

        return createSimpleSearchResult(count, authors);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Requests a part of the authors index.
 * @param params Parameters which affect what part of the index is returned
 * @returns List of all authors in that part of the index
 */
async function fetchAuthorsIndex(params: BaseSearchItemsParams): Promise<Array<SimpleSearchResultItem>> {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);
    return extractAuthorsIndex(html, params.count);
}

/**
 * Requests the authors index length.
 * @returns Authors index length
 */
async function fetchAuthorsIndexLength(): Promise<number> {
    // With the 'zzzzzzzzzzzzz' prefix, I get the last page of the index
    // There is a posibility that this will be a source of problems in the future
    // It is not a critical feature however
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, { prefix: 'zzzzzzzzzzzzz' });
    return extractAuthorsIndexLength(html);
}

/** Fetches a raw XML object containing all the author information. */
async function fetchAuthorXml(id: string): Promise<string> {
    const url = `${DBLP_URL}${convertNormalizedIdToDblpPath(id)}.xml`;
    return fetchXml(url);
}