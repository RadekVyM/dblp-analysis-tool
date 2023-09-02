import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'
import { fetchAuthor } from '@/server/fetching/authors'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import LinksList from './(components)/LinksList'
import { DblpAuthorHomonym, DblpAuthorInfo } from '@/shared/models/DblpAuthor'
import Bookmarks from './(components)/Bookmarks'
import { cn } from '@/shared/utils/tailwindUtils'
import { DblpPublication } from '@/shared/models/DblpPublication'
import Link from 'next/link'
import ListLink from '@/app/(components)/ListLink'

type AuthorPageParams = {
    params: {
        id: string
    }
}

type AuthorInfoParams = {
    className?: string,
    info: DblpAuthorInfo,
    authorId: string,
    authorName: string
}

type SameNameAuthorsParams = {
    homonyms: Array<DblpAuthorHomonym>
}

type AliasesAffiliationsParams = {
    info: DblpAuthorInfo,
    compact?: boolean
}

type PublicationsParams = {
    className?: string,
    publications: Array<DblpPublication>
}

export default async function AuthorPage({ params: { id } }: AuthorPageParams) {
    const author = await fetchAuthor(id);

    return (
        <PageContainer>
            <AddToRecentlySeen
                id={id}
                title={author.name} />
            <header>
                <PageTitle
                    title={author.name}
                    subtitle='Author'
                    className='pb-3' />

                {
                    author.info &&
                    <AuthorInfo
                        className='mb-12'
                        info={author.info}
                        authorId={author.id}
                        authorName={author.name} />
                }
            </header>

            {
                author.homonyms.length > 0 &&
                <SameNameAuthors
                    homonyms={author.homonyms} />
            }

            {
                author.publications.length > 0 &&
                <Publications
                    publications={author.publications} />
            }
        </PageContainer>
    )
}

function AuthorInfo({ className, info, authorId, authorName }: AuthorInfoParams) {
    return (
        <div className={cn('flex flex-col gap-7', info.affiliations.length > 0 ? '' : 'mt-4', className)}>
            <AliasesAffiliations
                info={info} />

            {
                info.links.length > 0 &&
                <LinksList
                    links={info.links} />
            }

            <Bookmarks
                className={cn(info.awards.length > 0 ? 'mb-1' : '')}
                authorId={authorId}
                title={authorName} />

            {
                info.awards.length > 0 &&
                <div>
                    <SectionTitle>Awards:</SectionTitle>
                    <ul className='flex flex-col gap-2 pl-4'>
                        {info.awards.map((award) =>
                            <li
                                key={award.title + award.label}
                                className='text-sm list-disc marker:text-primary'>
                                {award.title}
                            </li>)}
                    </ul>
                </div>
            }
        </div>
    )
}

function AliasesAffiliations({ info, compact }: AliasesAffiliationsParams) {
    return (
        (info.aliases.length > 0 || info.affiliations.length > 0) &&
        <div>
            {
                info.aliases.length > 0 &&
                <dl className='flex gap-2'>
                    <dt className={cn('font-semibold', compact ? 'hidden' : '')}>Alias: </dt>
                    <dd>{info.aliases.map((a) => a.title).join(' / ')}</dd>
                </dl>
            }
            {
                info.affiliations.length > 0 &&
                <ul>
                    {info.affiliations.map((affiliation) =>
                        <li
                            key={affiliation}
                            className={compact ? 'text-xs text-on-surface-muted' : 'text-sm'}>
                            {affiliation}
                        </li>)}
                </ul>
            }
        </div>
    )
}

function SameNameAuthors({ homonyms }: SameNameAuthorsParams) {
    return (
        <Section>
            <SectionTitle>Authors with the same name:</SectionTitle>
            <ul className='flex flex-col gap-2'>
                {homonyms.map((homonym) =>
                    <ListLink
                        key={homonym.url}
                        size='sm'
                        href={homonym.url}>
                        <AliasesAffiliations
                            compact={true}
                            info={homonym.info} />
                    </ListLink>)}
            </ul>
        </Section>
    )
}

function Publications({ publications, className }: PublicationsParams) {
    return (
        <Section>
            <SectionTitle>Publications:</SectionTitle>
            <ul className='flex flex-col gap-2 pl-4'>
                {publications.map((publ) =>
                    <li
                        className='list-disc marker:text-primary'
                        key={publ.id}>
                        <div
                            className='inline-flex flex-col'>
                            <span>
                                <b>{publ.type}</b> {publ.title}
                            </span>
                            <span
                                className='text-xs'>
                                {publ.authors.map(a => <><Link href={a.url}>{a.name}</Link>, </>)}
                            </span>
                        </div>
                    </li>)}
            </ul>
        </Section>
    )
}

function Section({ children }: { children: React.ReactNode }) {
    return (
        <section className='mb-12'>{children}</section>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className='mb-3 font-semibold'>{children}</h3>
    )
}