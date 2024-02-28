'use client'

import { useMemo } from 'react'
import { getUniqueCoauthors } from '@/services/graphs/authors'
import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { DblpAuthor } from '@/dtos/DblpAuthor'

/**
 * Hook that returns lists of common authors and uncommon authors of a selected author.
 * @param authorsMap Map of all author nodes
 * @param author Selected author
 * @param isOriginalAuthor Whether the selected author is an original author 
 * @param allOriginalAuthorIds IDs of all original authors
 * @returns Lists of common authors and uncommon authors
 */
export default function useCommonUncommonCoauthors(
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    author: DblpAuthor | undefined,
    isOriginalAuthor: boolean,
    allOriginalAuthorIds: Array<string>,
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
                .filter((a) => a && canGetToIncludedAuthorThroughAnotherAuthor(allOriginalAuthorIds, author.id, a));
        }
        return [];
    }, [author, authorsMap, allOriginalAuthorIds]);
    const uncommonCoauthors = useMemo(() => {
        if (!author?.publications) {
            return [];
        }

        if (isOriginalAuthor) {
            return getUniqueCoauthors(
                [author],
                [],
                (a) => {
                    const mapAuthor = authorsMap.get(a.id);
                    return !mapAuthor || a.id === author.id || canGetToIncludedAuthorThroughAnotherAuthor(allOriginalAuthorIds, author.id, mapAuthor);
                });
        }

        // Skip the selected author and all authors in the graph - if they are in the graph, they are common
        return getUniqueCoauthors([author], [], (a) => a.id === author.id || authorsMap.has(a.id));
    }, [author, authorsMap, isOriginalAuthor]);

    return { commonCoauthors, uncommonCoauthors };
}

/** Returns whether it is possible to get through included author to another (different) included author. */
// Let's have this graph of authors A, B and C:
//       C
//       |
//       |
//   B — A
// A and B are included authors.
// If I select A, this function returns 'false' for both B and C (A is 'startAuthorId' and B or C is 'middleAuthor').
// However, if I add an edge between B and C and select A, this function returs 'true' for C and 'false' for B:
//       C
//      ⁄|
//    ⁄  |
//   B — A
function canGetToIncludedAuthorThroughAnotherAuthor(allIncludedAuthorIds: Array<string>, startAuthorId: string, middleAuthor: PublicationPersonNodeDatum) {
    return allIncludedAuthorIds.some((id) => id !== startAuthorId && middleAuthor.coauthorIds.has(id));
}