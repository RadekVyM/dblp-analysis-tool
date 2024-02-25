'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo } from 'react'
import Table from './Table'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'
import { DblpPublication } from '@/dtos/DblpPublication'

type CoauthorsTableParams = {
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
}

/** Table that displays coauthors of all specified authors. */
export default function CoauthorsTable({ authors, publications }: CoauthorsTableParams) {
    const rows = useCoauthorsTableRows(authors, publications);

    return (
        <Table
            className='h-100 max-h-[max(70vh,25rem)]'
            rows={rows}
            columnHeaders={[
                {
                    column: 0,
                    sortingTitle: 'Sort by author name',
                    title: 'Couthor',
                    className: 'w-[20rem]'
                },
                {
                    column: 1,
                    sortingTitle: 'Sort by common coauthors count',
                    title: 'Common coauthors count'
                },
                {
                    column: 2,
                    sortingTitle: 'Sort by common publications count',
                    title: 'Common publications count'
                }
            ]}
            isFirstColumnHeader />
    )
}

function useCoauthorsTableRows(authors: Array<DblpAuthor>, publications?: Array<DblpPublication>) {
    return useMemo(() => {
        const { nodes } = convertToCoauthorsGraph(authors.flatMap((a) => a.publications).concat(publications || []));

        return nodes
            .filter((a) => !authors.some((aa) => aa.id === a.person.id))
            .map((node, index) => ([
                { value: node.person.name, presentedContent: node.person.name },
                { value: node.coauthorIds.size, presentedContent: node.coauthorIds.size },
                { value: node.personOccurrenceCount, presentedContent: node.personOccurrenceCount }
            ]))
    }, [authors, publications]);
}