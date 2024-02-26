'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import useAuthors from '@/hooks/authors/useAuthors'
import { useMemo } from 'react'
import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import { useIsClient } from 'usehooks-ts'
import LoadingPage from '@/components/shell/LoadingPage'
import ErrorPage from '@/components/shell/ErrorPage'
import { error as createError } from '@/utils/errors'
import useSelectedAuthorGroupMembers from '@/hooks/useSelectedAuthorGroupMembers'
import AuthorGroupMembers from '../../(components)/AuthorGroupMembers'

type PageContentParams = {
    authorGroupId: string,
    cachedAuthors: Array<DblpAuthor>,
    defaultSelectedYears?: Array<number>
}

export default function PageContent({ authorGroupId, cachedAuthors, defaultSelectedYears }: PageContentParams) {
    const { authorGroups, canUseAuthorGroups } = useAuthorGroups();
    const authorGroup = authorGroups.find((g) => g.id === authorGroupId);
    const authorIds = useMemo(() => authorGroup?.authors.map((a) => a.id) || [], [authorGroup]);
    const { authors, error } = useAuthors(cachedAuthors, authorIds);
    const {
        selectedAuthorIds,
        selectedAuthors,
        allPublications,
        toggleAuthor
    } = useSelectedAuthorGroupMembers(authors, authorGroup);
    const isClient = useIsClient();

    if (!isClient || !canUseAuthorGroups) {
        return (<LoadingPage />);
    }

    if (!authorGroup) {
        return (
            <ErrorPage
                params={{ error: createError('This author group could not be found.') }} />
        )
    }

    return (
        <PageContainer
            className='relative'>
            <header
                className='mb-10'>
                <PageTitle
                    title={authorGroup.title}
                    titleHref={`/authorgroup/${authorGroup.id}?${authorGroup.authors.map((a) => `id=${a.id}`).join('&')}`}
                    subtitle='Author group'
                    className='pb-3' />
            </header>

            <AuthorGroupMembers
                authors={authors}
                authorGroup={authorGroup}
                selectedAuthorIds={selectedAuthorIds}
                toggleAuthor={toggleAuthor} />

            <PageSection>
                <header
                    className='mb-4 flex gap-3 items-center'>
                    <PageSectionTitle className='text-xl mb-0'>Publications</PageSectionTitle>
                </header>

                <GroupedPublicationsList
                    publications={allPublications}
                    defaultSelectedYears={defaultSelectedYears} />
            </PageSection>

            <ScrollToTopButton />
        </PageContainer>
    );
}