import { BaseDblpSearchHit, DblpSearchResult } from '@/dtos/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { createLocalSearchPath } from '@/utils/urls'
import { redirect } from 'next/navigation'
import { queryAuthors } from '@/services/authors/authors'

export async function GET(request: Request, { params }: { params: { name: string } }) {
    let localUrl = createLocalSearchPath(SearchType.Author, { query: params.name });

    try {
        const response = await queryAuthors({ query: params.name, queryOptions: { exactWords: true }, completionsCount: 0, count: 2 });
        const authors = new DblpSearchResult<BaseDblpSearchHit>(response, SearchType.Author);

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