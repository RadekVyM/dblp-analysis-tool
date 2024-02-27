import { tryGetCachedRecords } from '@/services/cache/cache'
import PageContent from './(components)/PageContent'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { parseIntStrings } from '@/utils/strings'
import { PublicationsSearchParams } from '@/dtos/PublicationsSearchParams'

type AuthorGroupPublicationsPageParams = {
    params: {
        id: string
    },
    searchParams: {
        // IDs of the author group members
        id?: Array<string> | string
    } & PublicationsSearchParams
}

export default async function AuthorGroupPublicationsPage({ params: { id }, searchParams }: AuthorGroupPublicationsPageParams) {
    const authorIds: Array<string> = searchParams.id ?
        (typeof searchParams.id === 'string' ? [searchParams.id] : searchParams.id) :
        [];
    const years = searchParams.year ?
        parseIntStrings(searchParams.year) :
        [];
    const cachedAuthors = await tryGetCachedRecords<DblpAuthor>(authorIds);

    return (
        <PageContent
            authorGroupId={id}
            cachedAuthors={cachedAuthors}
            defaultSelectedYears={years} />
    )
}