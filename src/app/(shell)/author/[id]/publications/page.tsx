import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import { fetchAuthor } from '@/services/authors/authors'
import AliasesAffiliations from '../(components)/AliasesAffiliations'
import { Section, SectionTitle } from '../(components)/Section'
import GroupedPublicationsList from '../(components)/GroupedPublicationsList'
import ScrollToTopButton from '@/components/ScrollToTopButton'

type AuthorPublicationsPageParams = {
    params: {
        id: string
    }
}

export default async function AuthorPublicationsPage({ params: { id } }: AuthorPublicationsPageParams) {
    const author = await fetchAuthor(id);

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

            <Section>
                <header
                    className='mb-4 flex gap-3 items-center'>
                    <SectionTitle className='text-xl mb-0'>Publications</SectionTitle>
                </header>
                <GroupedPublicationsList
                    publications={author.publications} />
            </Section>

            <ScrollToTopButton />
        </PageContainer>
    )
}