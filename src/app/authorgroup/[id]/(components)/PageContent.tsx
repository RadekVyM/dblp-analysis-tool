'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import useAuthors from '@/hooks/authors/useAuthors'
import { useMemo } from 'react'
import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import { PageSubsectionTitle } from '@/components/shell/PageSection'
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

/** Content of the author group page. */
export default function PageContent({ cachedAuthors, authorGroupId }: PageContentParams) {
    const { authorGroups, canUseAuthorGroups } = useAuthorGroups();
    const authorGroup = authorGroups.find((g) => g.id === authorGroupId);
    const authorIds = useMemo(() => authorGroup?.authors.map((a) => a.id) || [], [authorGroup]);
    const { authors, error, isDone } = useAuthors(cachedAuthors, authorIds);
    const {
        selectedAuthorIds,
        selectedAuthors,
        allPublications,
        toggleAuthor
    } = useSelectedAuthorGroupMembers(authors, authorGroup);
    const exportedObject = useMemo(() => ({
        id: authorGroup?.id,
        title: authorGroup?.title,
        authors: authors
    }), [authorGroup, authors]);
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

    const publicationsUrl = `/authorgroup/${authorGroup.id}/publications?${authorGroup.authors.map((a) => `id=${a.id}`).join('&')}`;

    return (
        <PageContainer>
            <header
                className='mb-12'>
                <PageTitle
                    title={authorGroup.title}
                    annotation='Author group'
                    className='pb-3 mb-4' />

                <AuthorGroupButtons
                    authorGroupId={authorGroup.id}
                    authorGroupTitle={authorGroup.title}
                    exportedObject={exportedObject}
                    isLoadingDone={isDone} />
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
                        id='author-group-publications'
                        title='Publications of Selected Members'
                        publicationsUrl={publicationsUrl}
                        publications={allPublications}
                        maxDisplayedCount={3}>
                        <PageSubsectionTitle>Publications by Member</PageSubsectionTitle>

                        <AuthorGroupMembersStats
                            authors={selectedAuthors}
                            allPublications={allPublications}
                            scaffoldId='author-group-members-publications'
                            publicationsUrl={publicationsUrl} />
                    </PublicationsStatsSection>
                    <CoauthorsSection
                        id='author-group-coauthors'
                        title='Coauthors of Selected Members'
                        totalAuthorsCountDecrease={selectedAuthors.length}
                        authors={selectedAuthors}
                        tableCoauthorsExplanation={`Total number of coauthors that are common with any selected member and that are coauthors of the same publication as the author and selected member`}
                        tablePublicationsExplanation={`Total number of unique publications that are common with any selected member`} />
                </>
            }
        </PageContainer>
    );
}