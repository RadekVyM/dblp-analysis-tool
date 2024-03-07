'use client'

import { DblpVenue } from '@/dtos/DblpVenue'

/** Hook that returns a title for the venue volumes section of the venue page. */
export default function useVenueVolumes(venue: DblpVenue) {
    const hasVolumes = !venue.publications || venue.volumeGroups.reduce((prev, curr) => prev + curr.items.length, 0) === venue.publications.length;
    const hasWideVolumeTitles = venue.volumeGroups.some((g) => g.items.some((v) => v.title.length > 40));
    const volumesTitle = hasVolumes ? 'Volumes' : 'Tables of Contents';

    return {
        volumesTitle,
        hasWideVolumeTitles
    };
} 