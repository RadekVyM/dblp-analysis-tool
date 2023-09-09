import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'
import { fetchAuthor } from '@/server/fetching/authors'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import LinksList from './(components)/LinksList'
import { DblpAuthorHomonym, DblpAuthorInfo } from '@/shared/models/DblpAuthor'
import Bookmarks from './(components)/Bookmarks'
import { cn } from '@/shared/utils/tailwindUtils'
import ListLink from '@/app/(components)/ListLink'
import AuthorPublications from './(components)/AuthorPublications'
import { Section, SectionTitle } from './(components)/Section'
import AliasesAffiliations from './(components)/AliasesAffiliations'

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
                <AuthorPublications
                    publicationsUrl={`/author/${id}/publications`}
                    publications={author.publications}
                    maxDisplayedCount={5} />
            }
        </PageContainer>
    )
}

function AuthorInfo({ className, info, authorId, authorName }: AuthorInfoParams) {
    return (
        <div className={cn('flex flex-col gap-7', info.aliases.length > 0 || info.affiliations.length > 0 ? '' : 'mt-4', className)}>
            <AliasesAffiliations
                info={info} />

            {
                info.links.length > 0 &&
                <LinksList
                    links={info.links} />
            }

            <Bookmarks
                className={cn(info.awards.length > 0 ? 'mb-5' : '')}
                authorId={authorId}
                title={authorName} />

            {
                info.awards.length > 0 &&
                <div>
                    <SectionTitle className='text-xl'>Awards</SectionTitle>
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

function SameNameAuthors({ homonyms }: SameNameAuthorsParams) {
    return (
        <Section>
            <SectionTitle>Authors with the same name</SectionTitle>
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