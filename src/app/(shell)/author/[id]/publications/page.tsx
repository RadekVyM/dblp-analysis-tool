import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { fetchAuthor } from '@/services/authors/fetch-server'
import AliasesAffiliations from '../(components)/AliasesAffiliations'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { parseIntStrings } from '@/utils/strings'

type AuthorPublicationsPageParams = {
    params: {
        id: string
    },
    searchParams: { year?: Array<string> | string }
}

export default async function AuthorPublicationsPage({ params: { id }, searchParams }: AuthorPublicationsPageParams) {
    const author = await fetchAuthor(id);
    const years = searchParams.year ?
        parseIntStrings(searchParams.year) :
        [];

    return (
        <PageContainer
            className='relative'>
            <header
                className='mb-10'>
                <PageTitle
                    title={author.name}
                    titleHref={`/author/${id}`}
                    subtitle='Author'
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
                    defaultSelectedYears={years} />
            </PageSection>

            <ScrollToTopButton />
        </PageContainer>
    )
}