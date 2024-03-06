'use client'

import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useMemo } from 'react'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'

type VolumesStatsParams = {
    id: string,
    disablePublicationsLink?: boolean,
    hideLastAddedPublications?: boolean,
    publicationsStatsSectionTitle?: string,
    coauthorsSectionTitle?: string,
    explanationObject?: string,
    volumes: Array<DblpVenueVolume>,
    venueId: string,
    venueVolumeType: VenueVolumeType,
    volumeId?: string,
}

/** Displays all the (publications and authors) statistics of the specified volumes. */
export default function VolumesStats({
    id,
    publicationsStatsSectionTitle,
    coauthorsSectionTitle,
    explanationObject,
    volumes,
    venueId,
    volumeId,
    venueVolumeType,
    disablePublicationsLink,
    hideLastAddedPublications
}: VolumesStatsParams) {
    const allPublications = useMemo(() => {
        const publicationsMap = new Map<string, DblpPublication>();
        volumes.forEach((v) => v.publications.forEach((p) => publicationsMap.set(p.id, p)));
        return [...publicationsMap.values()];
    }, [volumes]);

    return (
        <>
            <PublicationsStatsSection
                id={`${id}-publications`}
                hideLastAdded={hideLastAddedPublications}
                title={publicationsStatsSectionTitle || (venueVolumeType === VenueVolumeType.Volume ? undefined : 'Publications of Selected Volumes')}
                publicationsUrl={disablePublicationsLink ? undefined : `${createLocalPath(venueId, SearchType.Venue, volumeId)}/publications?${createVolumeIdsParams(volumes)}`}
                publications={allPublications}
                maxDisplayedCount={3} />
            <CoauthorsSection
                id={`${id}-coauthors`}
                title={coauthorsSectionTitle || (venueVolumeType === VenueVolumeType.Volume ? 'Authors' : 'Authors of Selected Volumes')}
                authors={[]}
                publications={allPublications}
                tableCoauthorsExplanation={`Total number of coauthors of publications from the ${explanationObject || (venueVolumeType === VenueVolumeType.Volume ? 'venue' : 'selected volumes')}`}
                tablePublicationsExplanation={`Total number of unique publications from the ${explanationObject || (venueVolumeType === VenueVolumeType.Volume ? 'venue' : 'selected volumes')}`} />
        </>
    )
}

function createVolumeIdsParams(volumes: Array<DblpVenueVolume>) {
    return `${volumes.map((v) => `volumeId=${v.id}`).join('&')}`;
}