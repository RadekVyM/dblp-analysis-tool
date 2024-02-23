'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import VolumePublicationsSection from './VolumePublicationsSection'
import VolumesSelection from './VolumesSelection'

type MultipleVolumesPublicationsParams = {
    venue: DblpVenue,
    venueId: string,
    volumeId?: string,
}

/**
 * Content that should be displayed on a venue publications page with multiple venue volumes.
 * This includes volumes selection and the list of publications that can be filtered.
*/
export default function MultipleVolumesPublications({ venue }: MultipleVolumesPublicationsParams) {
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
                <VolumePublicationsSection
                    volumes={selectedVolumes} />
            }
        </>
    );
}