import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { getCurrentUser } from '@/services/auth/server'
import { getAuthorGroup } from '@/services/saves/authorGroups'
import { redirect } from 'next/navigation'
import { RemoveAuthorGroupButton } from './(components)/RemoveAuthorGroupButton'
import { unauthorizedError } from '@/utils/errors'
import PageContent from './(components)/PageContent'
import { tryGetCachedAuthors } from '@/services/cache/authors'

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

    const cachedAuthors = await tryGetCachedAuthors(authorGroup.authors.map((a) => a.id));

    return (
        <PageContainer>
            <header>
                <PageTitle
                    title={authorGroup.title}
                    subtitle='Author group'
                    className='pb-3' />
                <RemoveAuthorGroupButton
                    authorGroupId={authorGroup.id} />
            </header>

            <PageContent
                authorGroup={authorGroup}
                cachedAuthors={cachedAuthors} />
        </PageContainer>
    )
}