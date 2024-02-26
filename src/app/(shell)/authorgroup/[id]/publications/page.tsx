import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { getCurrentUser } from '@/services/auth'
import { getAuthorGroup } from '@/services/saves/authorGroups'
import { redirect } from 'next/navigation'
import { unauthorizedError } from '@/utils/errors'
import { tryGetCachedRecords } from '@/services/cache/cache'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import PageContent from './(components)/PageContent'
import { DblpAuthor } from '@/dtos/DblpAuthor'

type AuthorGroupPublicationsPageParams = {
    params: {
        id: string
    },
    searchParams: { id?: Array<string> | string }
}

export default async function AuthorGroupPublicationsPage({ params: { id }, searchParams }: AuthorGroupPublicationsPageParams) {
    const authorIds: Array<string> = searchParams.id ? (typeof searchParams.id === 'string' ? [searchParams.id] : searchParams.id) : [];
    const cachedAuthors = await tryGetCachedRecords<DblpAuthor>(authorIds);

    return (
        <PageContent
            authorGroupId={id}
            cachedAuthors={cachedAuthors} />
    )
}