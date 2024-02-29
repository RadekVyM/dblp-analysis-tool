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
                title={venueVolumeType === VenueVolumeType.Volume ? undefined : 'Publications of Selected Volumes'}
                publicationsUrl={volumeId ?
                    `/venue/${venueId}/${volumeId}/publications?${createVolumeIdsParams(volumes)}` :
                    `/venue/${venueId}/publications?${createVolumeIdsParams(volumes)}`}
                publications={allPublications}
                maxDisplayedCount={3} />
            <CoauthorsSection
                title={venueVolumeType === VenueVolumeType.Volume ? 'Authors' : 'Authors of Selected Volumes'}
                authors={[]}
                publications={allPublications}
                tableCoauthorsExplanation={`Total number of coauthors of publications from the ${venueVolumeType === VenueVolumeType.Volume ? 'venue' : 'selected volumes'}`}
                tablePublicationsExplanation={`Total number of unique publications from the ${venueVolumeType === VenueVolumeType.Volume ? 'venue' : 'selected volumes'}`} />
        </>
    )
}

function createVolumeIdsParams(volumes: Array<DblpVenueVolume>) {
    return `${volumes.map((v) => `volumeId=${v.id}`).join('&')}`;
}