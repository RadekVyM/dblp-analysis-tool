import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { fetchAuthor } from '@/services/authors/fetch-server'
import AddToVisitedAuthors from './(components)/AddToVisitedAuthors'
import LinksList from '@/components/LinksList'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import SaveAuthorButtons from './(components)/SaveAuthorButtons'
import { cn } from '@/utils/tailwindUtils'
import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import AliasesAffiliations from './(components)/AliasesAffiliations'
import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import SameNameAuthorsSection from './(components)/SameNameAuthorsSection'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'

type AuthorPageParams = {
    params: {
        id: string
    }
}

type AuthorInfoParams = {
    className?: string,
    author: DblpAuthor
}

type AwardsParams = {
    awards: Array<{ title: string, label: string }>,
}

/** Page displaying all the information about an author. */
export default async function AuthorPage({ params: { id } }: AuthorPageParams) {
    const author = await fetchAuthor(id);

    return (
        <PageContainer>
            <AddToVisitedAuthors
                id={id}
                title={author.name} />

            <header>
                <PageTitle
                    title={author.name}
                    annotation='Author'
                    className='pb-3' />

                <AuthorInfo
                    className='mb-12'
                    author={author} />
            </header>

            {
                author.homonyms.length > 0 &&
                <SameNameAuthorsSection
                    homonyms={author.homonyms} />
            }

            {
                author.info && author.info.awards.length > 0 &&
                <Awards
                    awards={author.info.awards} />
            }

            {
                author.publications.length > 0 &&
                <>
                    <PublicationsStatsSection
                        id='author-publications'
                        publicationsUrl={`${createLocalPath(id, SearchType.Author)}/publications`}
                        publications={author.publications}
                        maxDisplayedCount={3} />

                    <CoauthorsSection
                        id='author-coauthors'
                        authors={[author]}
                        totalAuthorsCountDecrease={1}
                        tableCoauthorsExplanation={`Total number of coauthors that are common with ${author.name} and that are coauthors of the same publication as the author and ${author.name}`}
                        tablePublicationsExplanation={`Total number of unique publications that are common with ${author.name}`} />
                </>
            }

        </PageContainer>
    )
}

async function AuthorInfo({ className, author }: AuthorInfoParams) {
    return (
        <div
            className={cn(
                'flex flex-col gap-7',
                author.info && (author.info.aliases.length > 0 || author.info.affiliations.length > 0) ? '' : 'mt-4',
                className)}>
            {
                author.info &&
                <AliasesAffiliations
                    info={author.info} />
            }

            {
                author.info && author.info.links.length > 0 &&
                <LinksList
                    links={author.info.links} />
            }

            <SaveAuthorButtons
                author={author} />
        </div>
    )
}

function Awards({ awards }: AwardsParams) {
    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>Awards</PageSectionTitle>
            <ul className='flex flex-col gap-2 pl-4'>
                {awards.map((award) =>
                    <li
                        key={award.title + award.label}
                        className='text-sm list-disc marker:text-primary'>
                        {award.title}
                    </li>)}
            </ul>
        </PageSection>
    )
}