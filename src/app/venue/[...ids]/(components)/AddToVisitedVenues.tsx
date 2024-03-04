'use client'

import useVisitedVenues from '@/hooks/visits/useVisitedVenues'
import { useEffectOnce } from 'usehooks-ts'

type AddToVisitedVenuesParams = {
    venueId: string,
    volumeId?: string,
    title: string
}

/** Adds the venue with the specified ID to the user's visited venues collection. */
export default function AddToVisitedVenues({ venueId, volumeId, title }: AddToVisitedVenuesParams) {
    const { visitedVenue } = useVisitedVenues();

    useEffectOnce(() => {
        visitedVenue(volumeId ? `${venueId}/${volumeId}` : venueId, title, venueId, volumeId);
    });

    return (
        <></>
    )
}