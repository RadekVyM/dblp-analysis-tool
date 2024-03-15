'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { DblpPublication } from '@/dtos/DblpPublication'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { useEffect, useMemo, useState } from 'react'

/**
 * Hook that creates data structures for managing selected author group members and related operations.
 * @param authors List of available members
 * @param authorGroup Author group that contains the members
 * @returns Data structures for managing selected author group members and related operations
 */
export default function useSelectedAuthorGroupMembers(authors: Array<DblpAuthor>, authorGroup?: AuthorGroup) {
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<Set<string>>(new Set(authorGroup?.authors.map((a) => a.id)));
    const selectedAuthors = useMemo(() => authors.filter((a) => selectedAuthorIds.has(a.id)), [authors, selectedAuthorIds]);
    const allPublications = useMemo(() => {
        const map = new Map<string, DblpPublication>();
        selectedAuthors.forEach((a) => a.publications.forEach((p) => map.set(p.id, p)));

        return [...map.values()];
    }, [selectedAuthors]);

    useEffect(() => {
        setSelectedAuthorIds(new Set(authorGroup?.authors.map((a) => a.id)));
    }, [authorGroup]);

    function toggleAuthor(id: string) {
        setSelectedAuthorIds((old) => {
            const newSet = new Set<string>(old);
            if (old.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    return {
        selectedAuthorIds,
        selectedAuthors,
        allPublications,
        toggleAuthor
    };
}