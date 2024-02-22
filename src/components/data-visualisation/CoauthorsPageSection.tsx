'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import DataVisualisationContainer from '@/components/data-visualisation/DataVisualisationContainer'
import { PageSection, PageSectionTitle } from '../shell/PageSection'
import CoauthorsGraphShell from '@/components/data-visualisation/coauthors-graph/CoauthorsGraphShell'
import CoauthorsTable from '@/components/data-visualisation/CoauthorsTable'
import ItemsStats from '@/components/ItemsStats'
import { getUniqueCoauthors } from '@/services/graphs/authors'
import { DblpPublication } from '@/dtos/DblpPublication'

type AuthorCoauthorsParams = {
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
    className?: string
}

/** Page section that displays the coauthors graph and table. */
export default function CoauthorsPageSection({ authors, publications }: AuthorCoauthorsParams) {
    return (
        <PageSection>
            <PageSectionTitle
                className='text-xl'>
                Coauthors
            </PageSectionTitle>

            <ItemsStats
                className='mb-6'
                totalCount={getUniqueCoauthors(authors, publications).length} />

            <CoauthorsGraphShell
                authors={authors}
                publications={publications} />

            <DataVisualisationContainer
                className='mt-10 overflow-hidden'>
                <CoauthorsTable
                    authors={authors}
                    publications={publications} />
            </DataVisualisationContainer>
        </PageSection>
    )
}