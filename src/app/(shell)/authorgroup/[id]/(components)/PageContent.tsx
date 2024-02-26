'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { SearchType } from '@/enums/SearchType'
import useAuthors from '@/hooks/authors/useAuthors'
import { createLocalPath } from '@/utils/urls'
import { useEffect, useMemo, useState } from 'react'
import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { PageSection, PageSectionTitle, PageSubsectionTitle } from '@/components/shell/PageSection'
import { isGreater } from '@/utils/array'
import Link from 'next/link'
import LinkArrow from '@/components/LinkArrow'
import AuthorGroupMembersStats from '@/components/data-visualisation/stats/AuthorGroupMembersStats'
import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { AuthorGroupButtons } from './AuthorGroupButtons'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import { error as createError } from '@/utils/errors'
import { useIsClient } from 'usehooks-ts'
import LoadingPage from '@/components/shell/LoadingPage'
import ErrorPage from '@/components/shell/ErrorPage'
import useSelectedAuthorGroupMembers from '@/hooks/useSelectedAuthorGroupMembers'
import AuthorGroupMembers from './AuthorGroupMembers'

type PageContentParams = {
    authorGroupId: string,
    cachedAuthors: Array<DblpAuthor>
}

export default function PageContent({ cachedAuthors, authorGroupId }: PageContentParams) {
    const { authorGroups } = useAuthorGroups();
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

    if (!isClient) {
        return (<LoadingPage />);
    }

    if (!authorGroup) {
        return (
            <ErrorPage
                params={{ error: createError('This author group could not be found.') }} />
        )
    }

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

            <AuthorGroupMembers
                authors={authors}
                authorGroup={authorGroup}
                selectedAuthorIds={selectedAuthorIds}
                toggleAuthor={toggleAuthor} />

            {
                selectedAuthors.length > 0 &&
                <>
                    <PublicationsStatsSection
                        publicationsUrl={`/authorgroup/${authorGroup.id}/publications?${authorGroup.authors.map((a) => `id=${a.id}`).join('&')}`}
                        publications={allPublications}
                        maxDisplayedCount={3} >
                        <PageSubsectionTitle>Publications by Member</PageSubsectionTitle>

                        <AuthorGroupMembersStats
                            authors={selectedAuthors}
                            allPublications={allPublications}
                            scaffoldId='author-group-members-publications' />
                    </PublicationsStatsSection>
                    <CoauthorsSection
                        authors={selectedAuthors} />
                </>
            }
        </PageContainer>
    );
}