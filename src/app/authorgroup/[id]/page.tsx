import PageContent from './(components)/PageContent'
import { tryGetCachedRecords } from '@/services/cache/cache'
import { DblpAuthor } from '@/dtos/DblpAuthor'

type AuthorGroupPageParams = {
    params: {
        id: string
    },
    searchParams: { id?: Array<string> | string }
}

export default async function AuthorGroupPage({ params: { id }, searchParams }: AuthorGroupPageParams) {
    const authorIds: Array<string> = searchParams.id ? (typeof searchParams.id === 'string' ? [searchParams.id] : searchParams.id) : [];
    const cachedAuthors = await tryGetCachedRecords<DblpAuthor>(authorIds);

    return (
        <PageContent
            authorGroupId={id}
            cachedAuthors={cachedAuthors} />
    )
}