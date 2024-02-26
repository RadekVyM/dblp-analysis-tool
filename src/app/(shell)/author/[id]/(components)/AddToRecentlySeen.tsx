'use client'

import useVisitedAuthors from '@/hooks/visits/useVisitedAuthors';
import { useEffect } from 'react'

type AddToRecentlySeenParams = {
    id: string,
    title: string
}

export default function AddToRecentlySeen({ id, title }: AddToRecentlySeenParams) {
    const { visitedAuthor } = useVisitedAuthors();

    useEffect(() => {
        visitedAuthor(id, title);
    }, []);

    return (
        <></>
    )
}