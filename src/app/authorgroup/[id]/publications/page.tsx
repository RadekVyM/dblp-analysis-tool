import { tryGetCachedRecords } from '@/services/cache/cache'
import PageContent from './(components)/PageContent'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { PublicationsSearchParams } from '@/dtos/PublicationsSearchParams'
import { parsePublicationsSearchParams } from '@/utils/publicationsSearchParams'

type AuthorGroupPublicationsPageParams = {
    params: {
        id: string
    },
    searchParams: {
        // IDs of the author group members
        id?: Array<string> | string
    } & PublicationsSearchParams
}

/** Page displaying all publications of an author group. */
export default async function AuthorGroupPublicationsPage({ params: { id }, searchParams }: AuthorGroupPublicationsPageParams) {
    const authorIds: Array<string> = searchParams.id ?
        (typeof searchParams.id === 'string' ? [searchParams.id] : searchParams.id) :
        [];
    const { years, types, venues, authors } = parsePublicationsSearchParams(searchParams);
    const cachedAuthors = await tryGetCachedRecords<DblpAuthor>(authorIds);

    return (
        <PageContent
            authorGroupId={id}
            cachedAuthors={cachedAuthors}
            defaultSelectedYears={years}
            defaultSelectedTypes={types}
            defaultSelectedVenueIds={venues}
            defaultSelectedAuthors={authors} />
    )
}