import { DblpAuthor } from '@/dtos/DblpAuthor'
import DataVisualisationContainer from '@/components/data-visualisation/DataVisualisationContainer'
import { PageSection, PageSectionTitle, PageSubsectionTitle } from '@/components/shell/PageSection'
import CoauthorsGraphShell from '@/components/data-visualisation/coauthors-graph/CoauthorsGraphShell'
import CoauthorsTable from '@/components/data-visualisation/CoauthorsTable'
import ItemsStats from '@/components/ItemsStats'
import { getUniqueCoauthors } from '@/services/graphs/authors'
import { DblpPublication } from '@/dtos/DblpPublication'

type CoauthorsSectionParams = {
    id: string,
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
    title?: React.ReactNode,
    totalAuthorsCountDecrease?: number,
    className?: string,
    tableCoauthorsExplanation?: string,
    tablePublicationsExplanation?: string,
}

/** Page section that displays the coauthors graph and table. */
export default function CoauthorsSection({ id, authors, publications, tableCoauthorsExplanation, tablePublicationsExplanation, title, totalAuthorsCountDecrease }: CoauthorsSectionParams) {
    return (
        <PageSection>
            <PageSectionTitle
                className='text-xl'>
                {title || 'Coauthors'}
            </PageSectionTitle>

            <ItemsStats
                className='mb-6'
                totalCount={getUniqueCoauthors(authors, publications).length -
                    (totalAuthorsCountDecrease === undefined ? 0 : totalAuthorsCountDecrease)} />

            <PageSubsectionTitle>Coauthorship Graph</PageSubsectionTitle>

            <CoauthorsGraphShell
                id={id}
                authors={authors}
                publications={publications} />

            <PageSubsectionTitle className='mt-10'>General Statistics</PageSubsectionTitle>

            <CoauthorsTable
                authors={authors}
                publications={publications} />

            <dl
                className='text-xs mt-4'>
                <div className='mb-2'>
                    <dt className='font-bold'>Coauthors count</dt>
                    <dd>{tableCoauthorsExplanation}</dd>
                </div>
                <div>
                    <dt className='font-bold'>Publications count</dt>
                    <dd>{tablePublicationsExplanation}</dd>
                </div>
            </dl>
        </PageSection>
    )
}