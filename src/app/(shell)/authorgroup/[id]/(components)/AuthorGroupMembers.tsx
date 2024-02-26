'use client'

import { SearchType } from '@/enums/SearchType'
import { createLocalPath } from '@/utils/urls'
import { useMemo } from 'react'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { isGreater } from '@/utils/array'
import Link from 'next/link'
import LinkArrow from '@/components/LinkArrow'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { DblpAuthor } from '@/dtos/DblpAuthor'

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

export default function AuthorGroupMembers({ authors, authorGroup, selectedAuthorIds, toggleAuthor }: MembersParams) {
    const members = useMemo(() => {
        const sortedAuthors = [...authorGroup.authors];
        sortedAuthors.sort((a, b) => isGreater(a.title, b.title));
        return sortedAuthors.map((a) => {
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
                className='grid grid-rows-[repeat(auto_1fr)] xs:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-x-4 gap-y-2'>
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
                            <input
                                title='Hide/Show'
                                type='checkbox'
                                checked={selectedAuthorIds.has(member.id)}
                                onChange={() => toggleAuthor(member.id)}
                                className='accent-on-surface-container w-4 h-4 self-end col-start-2' />
                        </div>
                    </li>)}
            </ul>
        </PageSection>
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