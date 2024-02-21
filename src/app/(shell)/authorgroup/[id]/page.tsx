import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { getCurrentUser } from '@/services/auth'
import { getAuthorGroup } from '@/services/saves/authorGroups'
import { redirect } from 'next/navigation'
import { AuthorGroupButtons } from './(components)/AuthorGroupButtons'
import { unauthorizedError } from '@/utils/errors'
import PageContent from './(components)/PageContent'
import { tryGetCachedRecords } from '@/services/cache/cache'
import { DblpAuthor } from '@/dtos/DblpAuthor'

type AuthorGroupPageParams = {
    params: {
        id: string
    }
}

export default async function AuthorGroupPage({ params: { id } }: AuthorGroupPageParams) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    const authorGroup = await getAuthorGroup(id, user);

    if (!authorGroup) {
        throw unauthorizedError('You cannot access this author group.');
    }

    const cachedAuthors = await tryGetCachedRecords<DblpAuthor>(authorGroup.authors.map((a) => a.id));

    return (
        <PageContainer>
            <header
                className='mb-12'>
                <PageTitle
                    title={authorGroup.title}
                    subtitle='Author group'
                    className='pb-3 mb-4' />

                <AuthorGroupButtons
                    authorGroupId={authorGroup.id}
                    authorGroupTitle={authorGroup.title} />
            </header>

            <PageContent
                authorGroup={authorGroup}
                cachedAuthors={cachedAuthors} />
        </PageContainer>
    )
}