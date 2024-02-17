'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import DataVisualisationContainer from '@/components/data-visualisation/DataVisualisationContainer'
import { PageSection, PageSectionTitle } from '../shell/PageSection'
import CoauthorsGraphShell from '@/components/data-visualisation/coauthors-graph/CoauthorsGraphShell'
import CoauthorsTable from '@/components/data-visualisation/CoauthorsTable'
import ItemsStats from '@/components/ItemsStats'
import { getUniqueCoauthors } from '@/services/graphs/authors'

type AuthorCoauthorsParams = {
    authors: Array<DblpAuthor>,
    className?: string
}

/** Page section that displays the coauthors graph and table. */
export default function AuthorCoauthors({ authors }: AuthorCoauthorsParams) {
    return (
        <PageSection>
            <PageSectionTitle
                className='text-xl'>
                Coauthors
            </PageSectionTitle>

            <ItemsStats
                className='mb-6'
                totalCount={getUniqueCoauthors(authors).length} />

            <CoauthorsGraphShell
                authors={authors} />

            <DataVisualisationContainer
                className='mt-10 overflow-hidden'>
                <CoauthorsTable
                    authors={authors} />
            </DataVisualisationContainer>
        </PageSection>
    )
}