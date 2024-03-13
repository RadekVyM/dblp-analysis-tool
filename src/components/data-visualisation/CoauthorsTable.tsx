'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo, useState } from 'react'
import Table from './Table'
import { canGetToOriginalAuthorThroughAnotherAuthor, convertToCoauthorsGraph, personNodeMatchesSearchPhrases } from '@/services/graphs/authors'
import { DblpPublication } from '@/dtos/DblpPublication'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import DataVisualisationContainer from './DataVisualisationContainer'
import SearchBox from '@/components/inputs/SearchBox'
import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { splitSearchQuery } from '@/utils/strings'

type CoauthorsTableParams = {
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
}

/** Table that displays coauthors of all specified authors. */
export default function CoauthorsTable({ authors, publications }: CoauthorsTableParams) {
    const [searchQuery, setSearchQuery] = useState('');
    const rows = useCoauthorsTableRows(authors, publications, searchQuery);

    return (
        <>
            <SearchBox
                className='mb-3'
                placeholder='Search authors...'
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery} />
            <DataVisualisationContainer
                className='overflow-clip'>
                <Table
                    className='max-h-[max(70vh,25rem)]'
                    rows={rows}
                    columnHeaders={[
                        {
                            column: 0,
                            sortingTitle: 'Sort by author name',
                            title: 'Author',
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
            </DataVisualisationContainer>
        </>
    )
}

function useCoauthorsTableRows(authors: Array<DblpAuthor>, publications?: Array<DblpPublication>, searchQuery?: string) {
    const graph = useMemo(() => {
        const uniquePublications = new Map<string, DblpPublication>();
        authors.forEach((a) => a.publications.forEach((p) => uniquePublications.set(p.id, p)));
        publications?.forEach((p) => uniquePublications.set(p.id, p));

        return convertToCoauthorsGraph([...uniquePublications.values()]);
    }, [authors, publications]);

    const rows = useMemo(() => {
        const { nodes, authorsMap } = graph;
        const authorIds = authors.map((a) => a.id);

        return nodes
            .map((node, index) => {
                const author = authors.find((a) => a.id === node.id);
                const commonCoauthors = [...node.coauthorIds.keys()]
                    .map((id) => authorsMap.get(id))
                    .filter((a) => a &&
                        (authors.length === 0 || canGetToOriginalAuthorThroughAnotherAuthor(authorIds, node.id, a))) as Array<PublicationPersonNodeDatum>;
                const commonCoauthorsCount = commonCoauthors.length;
                const commonPublicationsCount = author ?
                    getCommonPublicationsCount(author, commonCoauthors) :
                    node.personOccurrenceCount;

                return {
                    node,
                    row: [
                        { value: node.person.name, presentedContent: node.person.name, href: createLocalPath(node.person.id, SearchType.Author) },
                        { value: commonCoauthorsCount, presentedContent: commonCoauthorsCount },
                        { value: commonPublicationsCount, presentedContent: commonPublicationsCount }
                    ]
                };
            })
            .filter((r) => r.row[1].value !== 0 || authorIds.length === 0 || !authorIds.some((id) => r.node.id === id));
    }, [graph, authors]);

    const filteredRows = useMemo(() => {
        const searchPhrases = searchQuery ? splitSearchQuery(searchQuery) : [];

        return rows
            .filter((r) => personNodeMatchesSearchPhrases(r.node, searchPhrases))
            .map((r) => r.row);
    }, [rows, searchQuery]);

    return filteredRows;
}

function getCommonPublicationsCount(author: DblpAuthor, commonCoauthors: Array<PublicationPersonNodeDatum>) {
    let count = 0;

    author.publications.forEach((p) => {
        if ([...p.authors, ...p.editors].some((a) => commonCoauthors.some((ca) => ca.id === a.id))) {
            count += 1;
        }
    });

    return count;
}