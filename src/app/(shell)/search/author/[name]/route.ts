import { BaseSearchHit, SearchResult, createSearchResultFromRaw } from '@/dtos/search/SearchResult'
import { SearchType } from '@/enums/SearchType'
import { createLocalSearchPath } from '@/utils/urls'
import { redirect } from 'next/navigation'
import { fetchAuthors } from '@/services/authors/fetch'

/**
 * Tries to find an author with a name passed in the URL.
 * It redirects the user to a page of the author if it finds just one satisfactory author.
 * It redirects the user to the search page if it finds more than just one satisfactory author.
 * Otherwise it redirects the user to the author index page.
 * 
 * This endpoint is needed 
*/
export async function GET(request: Request, { params }: { params: { name: string } }) {
    let localUrl = createLocalSearchPath(SearchType.Author, { query: params.name });

    try {
        const response = await fetchAuthors({ query: params.name, queryOptions: { exactWords: true }, completionsCount: 0, count: 2 });
        const authors = createSearchResultFromRaw<BaseSearchHit>(response, SearchType.Author);

        if (authors.hits.total == 1) {
            const author = authors.hits.items[0];
            localUrl = author.info.localUrl;
        }
        else if (authors.hits.total == 0) {
            localUrl = createLocalSearchPath(SearchType.Author, {});
        }
    }
    catch (error) {
        console.log(`Error occured at "/search/author/${params.name}" endpoint: ${error}`);
    }

    redirect(localUrl);
}