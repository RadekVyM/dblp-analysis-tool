'use client'

import { SavedAuthor, SavedAuthors } from '@/dtos/SavedAuthors'
import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'

const LOCAL_AUTHOR_BOOKMARKS_KEY = 'local-authors-bookmarks';

export default function useLocalBookmarkedAuthors() {
    const [authors, setAuthors] = useLocalStorage<SavedAuthors>(LOCAL_AUTHOR_BOOKMARKS_KEY, {
        recentlySeen: [],
        bookmarked: [],
        groups: []
    });

    const addRecentlySeenAuthor = useCallback((id: string, title: string) => {
        setAuthors((prev) => {
            prev.recentlySeen = [{ title: title, id: id }, ...prev.recentlySeen];
            return { ...prev };
        });
    }, [authors]);

    const removeRecentlySeenAuthor = useCallback((id: string) => {
        setAuthors((prev) => {
            prev.recentlySeen = prev.recentlySeen.filter((a) => a.id != id);
            return { ...prev };
        });
    }, [authors]);

    const addBookmarkedAuthor = useCallback((id: string, title: string) => {
        setAuthors((prev) => {
            prev.bookmarked = [{ title: title, id: id }, ...prev.bookmarked];
            return { ...prev };
        });
    }, [authors]);

    const removeBookmarkedAuthor = useCallback((id: string) => {
        setAuthors((prev) => {
            prev.bookmarked = prev.bookmarked.filter((a) => a.id != id);
            return { ...prev };
        });
    }, [authors]);

    const addAuthorGroup = useCallback((id: string, title: string, authors: Array<SavedAuthor> = []) => {
        setAuthors((prev) => {
            prev.groups = [{ title: title, id: id, authors: authors }, ...prev.groups];
            return { ...prev };
        });
    }, [authors]);

    const updateAuthorGroup = useCallback((id: string, title: string, authors: Array<SavedAuthor> = []) => {
        setAuthors((prev) => {
            const group = prev.groups.find((g) => g.id === id);
            
            if (group) {
                group.title = title;
                group.authors = authors;
            }
            else {
                prev.groups = [{ title: title, id: id, authors: authors }, ...prev.groups];
            }

            return { ...prev };
        });
    }, [authors]);

    const removeAuthorGroup = useCallback((id: string) => {
        setAuthors((prev) => {
            prev.groups = prev.groups.filter((a) => a.id != id);
            return { ...prev };
        });
    }, [authors]);

    
    return {
        authors,
        addRecentlySeenAuthor,
        removeRecentlySeenAuthor,
        addBookmarkedAuthor,
        removeBookmarkedAuthor,
        addAuthorGroup,
        updateAuthorGroup,
        removeAuthorGroup,
    }
}