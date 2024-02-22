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

    const cachedAuthors = await tryGetCachedRecords<DblpAuthor>(authorGroup.authors.map((a) => a.id));

    return (
        <PageContainer
            className='relative'>
            <header
                className='mb-10'>
                <PageTitle
                    title={authorGroup.title}
                    titleHref={`/authorgroup/${id}`}
                    subtitle='Author group'
                    className='pb-3' />
            </header>

            <PageSection>
                <header
                    className='mb-4 flex gap-3 items-center'>
                    <PageSectionTitle className='text-xl mb-0'>Publications</PageSectionTitle>
                </header>

                <PageContent
                    authorGroup={authorGroup}
                    cachedAuthors={cachedAuthors} />
            </PageSection>

            <ScrollToTopButton />
        </PageContainer>
    )
}