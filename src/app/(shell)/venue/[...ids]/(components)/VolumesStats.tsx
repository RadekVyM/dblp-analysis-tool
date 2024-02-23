'use client'

import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useMemo } from 'react'
import { VenueVolumeType } from '@/enums/VenueVolumeType'

type VolumesStatsParams = {
    volumes: Array<DblpVenueVolume>,
    venueId: string,
    venueVolumeType: VenueVolumeType,
    volumeId?: string,
}

/** Displays all the (publications and authors) statistics of the specified volumes. */
export default function VolumesStats({ volumes, venueId, volumeId, venueVolumeType }: VolumesStatsParams) {
    const allPublications = useMemo(() => {
        const publicationsMap = new Map<string, DblpPublication>();
        volumes.forEach((v) => v.publications.forEach((p) => publicationsMap.set(p.id, p)));
        return [...publicationsMap.values()];
    }, [volumes]);

    return (
        <>
            <PublicationsStatsSection
                title={venueVolumeType === VenueVolumeType.Volume ? undefined : 'Selected Volumes Publications'}
                publicationsUrl={volumeId ? `/venue/${venueId}/${volumeId}/publications` : `/venue/${venueId}/publications`}
                publications={allPublications}
                maxDisplayedCount={3} />
            <CoauthorsSection
                authors={[]}
                publications={allPublications} />
        </>
    )
} 