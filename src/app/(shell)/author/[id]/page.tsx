import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { fetchAuthor } from '@/services/authors/fetch-server'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import LinksList from '@/components/LinksList'
import { DblpAuthorInfo } from '@/dtos/DblpAuthor'
import SaveAuthorButtons from './(components)/SaveAuthorButtons'
import { cn } from '@/utils/tailwindUtils'
import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import AliasesAffiliations from './(components)/AliasesAffiliations'
import { isAuthorizedOnServer } from '@/services/auth'
import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import SameNameAuthors from './(components)/SameNameAuthors'

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

type AwardsParams = {
    awards: Array<{ title: string, label: string }>,
}

export default async function AuthorPage({ params: { id } }: AuthorPageParams) {
    const author = await fetchAuthor(id);
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <PageContainer>

            {
                isAuthorized &&
                <AddToRecentlySeen
                    id={id}
                    title={author.name} />
            }

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
                author.info && author.info.awards.length > 0 &&
                <Awards
                    awards={author.info.awards} />
            }

            {
                author.publications.length > 0 &&
                <>
                    <PublicationsStatsSection
                        publicationsUrl={`/author/${id}/publications`}
                        publications={author.publications}
                        maxDisplayedCount={3} />

                    <CoauthorsSection
                        authors={[author]} />
                </>
            }

        </PageContainer>
    )
}

async function AuthorInfo({ className, info, authorId, authorName }: AuthorInfoParams) {
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <div className={cn('flex flex-col gap-7', info.aliases.length > 0 || info.affiliations.length > 0 ? '' : 'mt-4', className)}>
            <AliasesAffiliations
                info={info} />

            {
                info.links.length > 0 &&
                <LinksList
                    links={info.links} />
            }

            {
                isAuthorized &&
                <SaveAuthorButtons
                    authorId={authorId}
                    authorName={authorName} />
            }
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