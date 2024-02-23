'use client'

import useVisitedVenues from '@/hooks/useVisitedVenues'
import { useEffect } from 'react'

type AddToVisitedVenuesParams = {
    id: string,
    title: string
}

/** Adds the venue with the specified ID to the user's visited venues collection. */
export default function AddToVisitedVenues({ id, title }: AddToVisitedVenuesParams) {
    const { visitedVenue } = useVisitedVenues();

    useEffect(() => {
        visitedVenue(id, title);
    }, []);

    return (
        <></>
    )
}