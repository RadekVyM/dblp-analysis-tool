import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'
import { fetchAuthor } from '@/server/fetching/authors'
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
                    <span
                        title={`${author.publications.length} publications`}
                        className='px-2 py-0.5 text-xs rounded-lg bg-secondary text-on-secondary'>
                        {author.publications.length}
                    </span>
                </header>
                <GroupedPublicationsList
                    publications={author.publications} />
            </Section>
        </PageContainer>
    )
}