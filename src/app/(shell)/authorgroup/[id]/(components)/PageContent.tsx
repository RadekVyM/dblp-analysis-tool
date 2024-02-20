'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { SearchType } from '@/enums/SearchType'
import useAuthors from '@/hooks/authors/useAuthors'
import { createLocalPath } from '@/utils/urls'
import { useEffect, useMemo, useState } from 'react'
import AuthorCoauthors from '@/components/data-visualisation/AuthorCoauthors'
import AuthorPublications from '@/app/(shell)/author/[id]/(components)/AuthorPublications'
import { DblpPublication } from '@/dtos/DblpPublication'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { isGreater } from '@/utils/array'
import Link from 'next/link'
import LinkArrow from '@/components/LinkArrow'
import Button from '@/components/Button'

type PageContentParams = {
    authorGroup: AuthorGroup,
    cachedAuthors: Array<DblpAuthor>
}

type MembersParams = {
    authorGroup: AuthorGroup,
    authors: Array<DblpAuthor>,
    selectedAuthorIds: Set<string>,
    toggleAuthor: (id: string) => void,
}

type MemberHeaderParams = {
    member: Member
}

type MemberInfoParams = {
    author: DblpAuthor
}

type Member = {
    name: string,
    id: string,
    fetchedData?: DblpAuthor
}

export default function PageContent({ authorGroup, cachedAuthors }: PageContentParams) {
    const authorIds = useMemo(() => authorGroup.authors.map((a) => a.id), [authorGroup]);
    const { isLoading, authors, error } = useAuthors(cachedAuthors, authorIds);
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<Set<string>>(new Set(authorGroup.authors.map((a) => a.id)));
    const selectedAuthors = useMemo(() => authors.filter((a) => selectedAuthorIds.has(a.id)), [authors, selectedAuthorIds]);
    const allPublications = useMemo(() => {
        const map = new Map<string, DblpPublication>();
        selectedAuthors.forEach((a) => a.publications.forEach((p) => map.set(p.id, p)));

        return [...map.values()];
    }, [selectedAuthors]);

    useEffect(() => {
        setSelectedAuthorIds(new Set(authorGroup.authors.map((a) => a.id)));
    }, [authorGroup]);

    function toggleAuthor(id: string) {
        setSelectedAuthorIds((old) => {
            const newSet = new Set<string>(old);
            if (old.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    return (
        <>
            <Members
                authors={authors}
                authorGroup={authorGroup}
                selectedAuthorIds={selectedAuthorIds}
                toggleAuthor={toggleAuthor} />

            {
                selectedAuthors.length > 0 &&
                <>
                    <AuthorPublications
                        publicationsUrl={`/authorgroup/${authorGroup.id}/publications`}
                        publications={allPublications}
                        maxDisplayedCount={3} />
                    <AuthorCoauthors
                        authors={selectedAuthors} />
                </>
            }
        </>
    );
}

function Members({ authors, authorGroup, selectedAuthorIds, toggleAuthor }: MembersParams) {
    const members = useMemo(() => {
        return authorGroup.authors.toSorted((a, b) => isGreater(a.title, b.title)).map((a) => {
            const fetched = authors.find((fa) => fa.id === a.id);

            return {
                name: a.title,
                id: a.id,
                fetchedData: fetched
            } as Member;
        })
    }, [authorGroup, authors]);

    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>Members</PageSectionTitle>

            <ul
                className='grid grid-rows-[repeat(auto_1fr)] xs:grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-x-4 gap-y-2'>
                {members.map((member) =>
                    <li
                        key={member.id}
                        className='p-4 min-w-0 row-span-2 grid grid-rows-subgrid
                            bg-surface-container rounded-lg border border-outline'>
                        <MemberHeader
                            member={member} />
                        <div
                            className='grid grid-cols-[1fr_auto]'>
                            {
                                member.fetchedData ?
                                    <MemberInfo
                                        author={member.fetchedData} /> :
                                    <span>Downloading...</span>
                            }
                            <Button
                                className='col-start-2'
                                onClick={() => toggleAuthor(member.id)}>
                                {selectedAuthorIds.has(member.id) ? 'S' : 'U'}
                            </Button>
                        </div>
                    </li>)}
            </ul>
        </PageSection >
    )
}

function MemberHeader({ member }: MemberHeaderParams) {
    return (
        <header>
            <Link
                prefetch={false}
                className='link-heading block w-fit text-on-surface-muted hover:text-on-surface transition-colors'
                href={createLocalPath(member.id, SearchType.Author)}>
                <h4
                    className='inline font-semibold text-on-surface'>
                    {member.name}
                </h4>
                <LinkArrow
                    className='w-6 h-5 ml-[-0.1rem] mt-[-0.2rem]' />
            </Link>

            {
                member.fetchedData?.info && member.fetchedData.info.aliases.length > 0 &&
                <dl className='inline'>
                    <dt className={'text-xs inline font-semibold'}>Alias: </dt>
                    <dd className='text-xs inline'>{member.fetchedData.info.aliases.map((a) => a.title).join(' / ')}</dd>
                </dl>
            }
        </header>
    )
}

function MemberInfo({ author }: MemberInfoParams) {
    return (
        <ul
            className='text-sm flex flex-col gap-1 list-disc marker:text-primary pl-4'>
            <li>{author.publications.length} publications</li>
            {
                author.info && author.info.awards.length > 0 &&
                <li>{author.info.awards.length} awards</li>
            }
        </ul>
    )
}