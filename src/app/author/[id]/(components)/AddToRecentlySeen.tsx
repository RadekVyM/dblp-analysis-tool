'use client'

import useLocalBookmarkedAuthors from '@/client/hooks/useLocalBookmarkedAuthors'
import { useEffect } from 'react'

type AddToRecentlySeenParams = {
    id: string,
    title: string
}

export default function AddToRecentlySeen({ id, title }: AddToRecentlySeenParams) {
    const { addRecentlySeenAuthor, removeRecentlySeenAuthor } = useLocalBookmarkedAuthors();

    useEffect(() => {
        removeRecentlySeenAuthor(id);
        addRecentlySeenAuthor(id, title);
    }, []);

    return (
        <></>
    )
}