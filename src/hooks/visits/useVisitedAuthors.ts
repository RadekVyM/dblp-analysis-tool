'use client'

import { useCallback } from 'react'
import { VisitedAuthor } from '@/dtos/saves/VisitedAuthor'
import { useLocalStorage } from 'usehooks-ts'

const VISITED_AUTHORS_STORAGE_KEY = 'VISITED_AUTHORS_STORAGE_KEY';

/** Hook that handles loading of visited authors and provides operations for adding and deleting a visited author. */
export default function useVisitedAuthors() {
    const [visitedAuthors, setVisitedAuthors] = useLocalStorage(VISITED_AUTHORS_STORAGE_KEY, new Array<VisitedAuthor>());

    const visitedAuthor = useCallback(async (id: string, title: string) => {
        setVisitedAuthors((old) => {
            const author = old.find((a) => a.id === id);

            if (author) {
                author.visitsCount += 1;
                return [author, ...(old.filter((a) => a.id !== id))];
            }

            return [{ title: title, id: id, visitsCount: 1 }, ...old];
        });
    }, [setVisitedAuthors]);

    const removeVisitedAuthor = useCallback(async (id: string) => {
        setVisitedAuthors((old) => {
            return [...(old.filter((a) => a.id !== id))];
        });
    }, [setVisitedAuthors]);

    return {
        visitedAuthors,
        visitedAuthor,
        removeVisitedAuthor
    };
}