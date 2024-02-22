'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import VolumesContent from './VolumesContent'
import VolumeGroups from './VolumeGroups'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'

type VolumesPageContentParams = {
    venue: DblpVenue,
    venueId: string,
    volumeId?: string,
}

export default function VolumesPageContent({ venue, venueId, volumeId }: VolumesPageContentParams) {
    const { selectedVolumes, selectedVolumeIds, toggleVolume, onFetchedVolume } = useSelectableFetchableVenueVolumes(venue);

    return (
        <>
            <VolumeGroups
                toggleVolume={toggleVolume}
                selectedVolumeIds={selectedVolumeIds}
                groups={venue.volumeGroups}
                onFetchedVolume={onFetchedVolume} />

            {
                selectedVolumes.length > 0 &&
                <VolumesContent
                    volumes={selectedVolumes}
                    venueId={venueId}
                    volumeId={volumeId} />
            }
        </>
    )
}