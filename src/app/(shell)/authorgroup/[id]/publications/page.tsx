import { tryGetCachedRecords } from '@/services/cache/cache'
import PageContent from './(components)/PageContent'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { parseIntStrings } from '@/utils/strings'

type AuthorGroupPublicationsPageParams = {
    params: {
        id: string
    },
    searchParams: { id?: Array<string> | string, year?: Array<string> | string }
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