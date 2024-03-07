'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo } from 'react'
import Table from './Table'
import { canGetToOriginalAuthorThroughAnotherAuthor, convertToCoauthorsGraph } from '@/services/graphs/authors'
import { DblpPublication } from '@/dtos/DblpPublication'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'

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
                    title: 'Coauthor',
                    className: 'w-[20rem]'
                },
                {
                    column: 1,
                    sortingTitle: 'Sort by coauthors count',
                    title: 'Coauthors count',
                },
                {
                    column: 2,
                    sortingTitle: 'Sort by publications count',
                    title: 'Publications count',
                }
            ]}
            isFirstColumnHeader />
    )
}

function useCoauthorsTableRows(authors: Array<DblpAuthor>, publications?: Array<DblpPublication>) {
    return useMemo(() => {
        const uniquePublications = new Map<string, DblpPublication>();
        authors.forEach((a) => a.publications.forEach((p) => uniquePublications.set(p.id, p)));
        publications?.forEach((p) => uniquePublications.set(p.id, p));

        const { nodes, authorsMap } = convertToCoauthorsGraph([...uniquePublications.values()]);
        const authorIds = authors.map((a) => a.id);

        return nodes
            .filter((a) => !authors.some((aa) => aa.id === a.person.id))
            .map((node, index) => {
                const commonCoauthorsCount = [...node.coauthorIds]
                    .map((id) => authorsMap.get(id))
                    .filter((a) => a &&
                        (authors.length === 0 || canGetToOriginalAuthorThroughAnotherAuthor(authorIds, node.id, a)))
                    .length;

                return [
                    { value: node.person.name, presentedContent: node.person.name, href: createLocalPath(node.person.id, SearchType.Author) },
                    { value: commonCoauthorsCount, presentedContent: commonCoauthorsCount },
                    { value: node.personOccurrenceCount, presentedContent: node.personOccurrenceCount }
                ];
            })
    }, [authors, publications]);
}