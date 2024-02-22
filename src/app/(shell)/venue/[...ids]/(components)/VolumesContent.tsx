'use client'

import AuthorPublications from '@/app/(shell)/author/[id]/(components)/AuthorPublications'
import CoauthorsPageSection from '@/components/data-visualisation/CoauthorsPageSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useMemo } from 'react'

type VolumesContentParams = {
    volumes: Array<DblpVenueVolume>,
    venueId: string,
    volumeId?: string,
}

export default function VolumesContent({ volumes, venueId, volumeId }: VolumesContentParams) {
    const allPublications = useMemo(() => {
        const publicationsMap = new Map<string, DblpPublication>();
        volumes.forEach((v) => v.publications.forEach((p) => publicationsMap.set(p.id, p)));
        return [...publicationsMap.values()];
    }, [volumes]);

    return (
        <>
            <AuthorPublications
                publicationsUrl={volumeId ? `/venue/${venueId}/${volumeId}/publications` : `/venue/${venueId}/publications`}
                publications={allPublications}
                maxDisplayedCount={3} />
            <CoauthorsPageSection
                authors={[]}
                publications={allPublications} />
        </>
    )
} 