'use client'

import AuthorPublications from '@/app/(shell)/author/[id]/(components)/AuthorPublications'
import { DblpPublication } from '@/dtos/DblpPublication'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useMemo } from 'react'

type VolumesContentParams = {
    volumes: Array<DblpVenueVolume>
}

export default function VolumesContent({ volumes }: VolumesContentParams) {
    const allPublications = useMemo(() => {
        const publicationsMap = new Map<string, DblpPublication>();
        volumes.forEach((v) => v.publications.forEach((p) => publicationsMap.set(p.id, p)));
        return [...publicationsMap.values()];
    }, [volumes]);

    return (
        <AuthorPublications
            publicationsUrl={`/`}
            publications={allPublications}
            maxDisplayedCount={3} />
    )
} 