import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { fetchAuthor } from '@/services/authors/fetch-server'
import AliasesAffiliations from '../(components)/AliasesAffiliations'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import ScrollToTopButton from '@/components/inputs/ScrollToTopButton'
import { PublicationsSearchParams } from '@/dtos/PublicationsSearchParams'
import { parsePublicationsSearchParams } from '@/utils/publicationsSearchParams'

type AuthorPublicationsPageParams = {
    params: {
        id: string
    },
    searchParams: {} & PublicationsSearchParams
}

/** Page displaying all publications of an author. */
export default async function AuthorPublicationsPage({ params: { id }, searchParams }: AuthorPublicationsPageParams) {
    const author = await fetchAuthor(id);
    const { years, types, venues, authors } = parsePublicationsSearchParams(searchParams);

    return (
        <PageContainer
            className='relative'>
            <header
                className='mb-10'>
                <PageTitle
                    title={author.name}
                    titleHref={`/author/${id}`}
                    annotation='Author'
                    className='pb-3' />

                {
                    author.info &&
                    <AliasesAffiliations
                        info={author.info} />
                }
            </header>

            <PageSection>
                <header
                    className='mb-4 flex gap-3 items-center'>
                    <PageSectionTitle className='text-xl mb-0'>Publications</PageSectionTitle>
                </header>
                <GroupedPublicationsList
                    publications={author.publications}
                    defaultSelectedYears={years}
                    defaultSelectedTypes={types}
                    defaultSelectedVenueIds={venues}
                    defaultSelectedAuthors={authors} />
            </PageSection>

            <ScrollToTopButton />
        </PageContainer>
    )
}