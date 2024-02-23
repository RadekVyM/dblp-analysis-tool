'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import VolumesStats from './VolumesStats'
import VolumesSelection from './VolumesSelection'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import { VenueVolumeType } from '@/enums/VenueVolumeType'

type MultipleVolumesPageContentParams = {
    venue: DblpVenue,
    venueVolumeType: VenueVolumeType,
    venueId: string,
    volumeId?: string,
}

/**
 * Content that should be displayed on a venue page with multiple venue volumes.
 * This includes volumes selection and all the volumes statistics.
*/
export default function MultipleVolumesPageContent({ venue, venueVolumeType, venueId, volumeId }: MultipleVolumesPageContentParams) {
    const { selectedVolumes, selectedVolumeIds, toggleVolume, onFetchedVolume } = useSelectableFetchableVenueVolumes(venue);

    return (
        <>
            <VolumesSelection
                toggleVolume={toggleVolume}
                selectedVolumeIds={selectedVolumeIds}
                groups={venue.volumeGroups}
                onFetchedVolume={onFetchedVolume} />

            {
                selectedVolumes.length > 0 &&
                <VolumesStats
                    venueVolumeType={venueVolumeType}
                    volumes={selectedVolumes}
                    venueId={venueId}
                    volumeId={volumeId} />
            }
        </>
    )
}