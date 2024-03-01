'use client'

import { useMemo } from 'react'
import { canGetToOriginalAuthorThroughAnotherAuthor, getUniqueCoauthors } from '@/services/graphs/authors'
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
                .filter((a) => a &&
                    (allOriginalAuthorIds.length === 0 || canGetToOriginalAuthorThroughAnotherAuthor(allOriginalAuthorIds, author.id, a)));
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
                    return !mapAuthor || a.id === author.id || canGetToOriginalAuthorThroughAnotherAuthor(allOriginalAuthorIds, author.id, mapAuthor);
                });
        }

        // Skip the selected author and all authors in the graph - if they are in the graph, they are common
        return getUniqueCoauthors([author], [], (a) => {
            const mapAuthor = authorsMap.get(a.id);
            return a.id === author.id || (!!mapAuthor && (allOriginalAuthorIds.length === 0 || canGetToOriginalAuthorThroughAnotherAuthor(allOriginalAuthorIds, author.id, mapAuthor)));
        });
    }, [author, authorsMap, isOriginalAuthor, allOriginalAuthorIds]);

    return { commonCoauthors, uncommonCoauthors };
}