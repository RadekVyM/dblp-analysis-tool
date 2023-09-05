import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'
import { fetchAuthor } from '@/server/fetching/authors'
import AuthorPublications from '../(components)/AuthorPublications'
import AliasesAffiliations from '../(components)/AliasesAffiliations'
import { Section, SectionTitle } from '../(components)/Section'
import GroupedPublicationsList from '../(components)/GroupedPublicationsList'

type AuthorPublicationsPageParams = {
    params: {
        id: string
    }
}

export default async function AuthorPublicationsPage({ params: { id } }: AuthorPublicationsPageParams) {
    const author = await fetchAuthor(id);

    return (
        <PageContainer>
            <header
                className='mb-10'>
                <PageTitle
                    title={author.name}
                    subtitle='Author'
                    className='pb-3' />

                {
                    author.info &&
                    <AliasesAffiliations
                        info={author.info} />
                }
            </header>

            <Section>
                <SectionTitle className='text-xl'>Publications ({author.publications.length})</SectionTitle>
                <GroupedPublicationsList
                    publications={author.publications} />
            </Section>
        </PageContainer>
    )
}