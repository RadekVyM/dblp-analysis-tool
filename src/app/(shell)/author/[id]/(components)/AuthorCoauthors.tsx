'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import DataVisualisationContainer from '@/components/data-visualisation/DataVisualisationContainer'
import { Section, SectionTitle } from './Section'
import CoauthorsGraphShell from '@/components/data-visualisation/coauthors-graph/CoauthorsGraphShell'
import CoauthorsTable from '@/components/data-visualisation/CoauthorsTable'

type AuthorCoauthorsParams = {
    authors: Array<DblpAuthor>,
    className?: string
}

export default function AuthorCoauthors({ authors }: AuthorCoauthorsParams) {
    return (
        <Section>
            <SectionTitle
                className='text-xl'>
                Coauthors
            </SectionTitle>

            <CoauthorsGraphShell
                authors={authors} />

            <DataVisualisationContainer
                className='mt-10 overflow-hidden'>
                <CoauthorsTable
                    authors={authors} />
            </DataVisualisationContainer>
        </Section>
    )
}