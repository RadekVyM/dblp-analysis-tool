'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo } from 'react'
import Table from './Table'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'

type CoauthorsTableParams = {
    authors: Array<DblpAuthor>
}

export default function CoauthorsTable({ authors }: CoauthorsTableParams) {
    const rows = useMemo(() => {
        const { nodes } = convertToCoauthorsGraph(authors.flatMap((a) => a.publications));

        return nodes
            .filter((a) => !authors.some((aa) => aa.id === a.person.id))
            .map((node, index) => ([
                { value: node.person.name, presentedContent: node.person.name },
                { value: node.coauthorIds.size, presentedContent: node.coauthorIds.size },
                { value: node.count, presentedContent: node.count }
            ]))
    }, [authors]);

    return (
        <Table
            className='h-100 max-h-[max(60vh,20rem)]'
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