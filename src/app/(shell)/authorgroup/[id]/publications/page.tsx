import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { getCurrentUser } from '@/services/auth'
import { getAuthorGroup } from '@/services/saves/authorGroups'
import { redirect } from 'next/navigation'
import { unauthorizedError } from '@/utils/errors'
import { tryGetCachedAuthors } from '@/services/cache/authors'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'

type AuthorGroupPublicationsPageParams = {
    params: {
        id: string
    }
}

export default async function AuthorGroupPublicationsPage({ params: { id } }: AuthorGroupPublicationsPageParams) {
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
        <PageContainer
            className='relative'>
            <header
                className='mb-10'>
                <PageTitle
                    title={authorGroup.title}
                    titleHref={`/authorgroup/${id}`}
                    subtitle='Author'
                    className='pb-3' />
            </header>

            <PageSection>
                <header
                    className='mb-4 flex gap-3 items-center'>
                    <PageSectionTitle className='text-xl mb-0'>Publications</PageSectionTitle>
                </header>
            </PageSection>

            <ScrollToTopButton />
        </PageContainer>
    )
}