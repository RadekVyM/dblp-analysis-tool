'use client'

import useVisitedVenues from '@/hooks/useVisitedVenues'
import { useEffect } from 'react'

type AddToRecentlySeenParams = {
    id: string,
    title: string
}

export default function AddToRecentlySeen({ id, title }: AddToRecentlySeenParams) {
    const { visitedVenue } = useVisitedVenues();

    useEffect(() => {
        visitedVenue(id, title);
    }, []);

    return (
        <></>
    )
}