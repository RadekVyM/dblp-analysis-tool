'use client'

import { useMemo } from 'react'
import { getUniqueCoauthors } from '@/services/graphs/authors'
import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { DblpAuthor } from '@/dtos/DblpAuthor'

export default function useCommonUncommonCoauthors(
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    author: DblpAuthor | undefined,
    isIncludedAuthor: boolean,
    allIncludedAuthorIds: Array<string>,
) {
    const commonCoauthors = useMemo(() => {
        // There may be an edge between two authors even though it is not in the graph
        // Let's say that an included author A has two publications 'b' with a coauthor B and 'c' with a coauthor C.
        // => They are both coauthors of different publications and there is no edge between them in the graph:
        //       C
        //       |
        //       |
        //   B — A
        // However, there still can exist an edge between B and C and the following code takes that into account.
        // If I select B and am able to get from B through C to A (using just two edges), C is the common coauthor of B and A.
        //       C
        //      ⁄|
        //    ⁄  |
        //   B — A
        if (author) {
            return getUniqueCoauthors([author], [], (a) => a.id === author.id || !authorsMap.has(a.id))
                .map((a) => authorsMap.get(a.id))
                .filter((a) => a && canGetToIncludedAuthorThroughAnotherAuthor(allIncludedAuthorIds, author.id, a));
        }
        return [];
    }, [author, authorsMap, allIncludedAuthorIds]);
    const uncommonCoauthors = useMemo(() => {
        if (!author?.publications) {
            return [];
        }

        if (isIncludedAuthor) {
            return getUniqueCoauthors(
                [author],
                [],
                (a) => {
                    const mapAuthor = authorsMap.get(a.id);
                    return !mapAuthor || a.id === author.id || canGetToIncludedAuthorThroughAnotherAuthor(allIncludedAuthorIds, author.id, mapAuthor);
                })
                .filter((a) => !allIncludedAuthorIds.includes(a.id));
        }

        // Skip the selected author and all authors in the graph - if they are in the graph, they are common
        return getUniqueCoauthors([author], [], (a) => a.id === author.id || authorsMap.has(a.id));
    }, [author, authorsMap, isIncludedAuthor]);

    return { commonCoauthors, uncommonCoauthors };
}

function canGetToIncludedAuthorThroughAnotherAuthor(allIncludedAuthorIds: Array<string>, startAuthorId: string, middleAuthor: PublicationPersonNodeDatum) {
    return allIncludedAuthorIds.some((id) => id !== startAuthorId && middleAuthor.coauthorIds.has(id));
}