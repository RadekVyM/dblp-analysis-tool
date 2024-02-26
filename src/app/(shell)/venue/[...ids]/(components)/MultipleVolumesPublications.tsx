'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import VolumePublicationsSection from './VolumePublicationsSection'
import VolumesSelection from './VolumesSelection'

type MultipleVolumesPublicationsParams = {
    venue: DblpVenue,
    venueId: string,
    /** Volume ID is ignored here. */
    volumeId?: string,
    defaultSelectedYears?: Array<number>,
    defaultSelectedVolumeIds?: Array<string>,
}

/**
 * Content that should be displayed on a venue publications page with multiple venue volumes.
 * This includes volumes selection and the list of publications that can be filtered.
*/
export default function MultipleVolumesPublications({ venue, defaultSelectedYears, defaultSelectedVolumeIds }: MultipleVolumesPublicationsParams) {
    const { selectedVolumes, selectedVolumeIds, toggleVolume, onFetchedVolume } = useSelectableFetchableVenueVolumes(venue, defaultSelectedVolumeIds);

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
                    volumes={selectedVolumes}
                    defaultSelectedYears={defaultSelectedYears} />
            }
        </>
    );
}