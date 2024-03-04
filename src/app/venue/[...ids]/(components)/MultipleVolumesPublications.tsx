'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import VolumePublicationsSection from './VolumePublicationsSection'
import VolumesSelection from './VolumesSelection'
import { DefaultSelectedPublicationsParams } from '@/dtos/DefaultSelectedPublicationsParams'

type MultipleVolumesPublicationsParams = {
    venue: DblpVenue,
    venueId: string,
    /** Volume ID is ignored here. */
    volumeId?: string,
    defaultSelectedVolumeIds?: Array<string>,
} & DefaultSelectedPublicationsParams

/**
 * Content that should be displayed on a venue publications page with multiple venue volumes.
 * This includes volumes selection and the list of publications that can be filtered.
*/
export default function MultipleVolumesPublications({
    venue,
    defaultSelectedYears,
    defaultSelectedTypes,
    defaultSelectedVenueIds,
    defaultSelectedVolumeIds,
    defaultSelectedAuthors
}: MultipleVolumesPublicationsParams) {
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
                    defaultSelectedYears={defaultSelectedYears}
                    defaultSelectedTypes={defaultSelectedTypes}
                    defaultSelectedVenueIds={defaultSelectedVenueIds}
                    defaultSelectedAuthors={defaultSelectedAuthors} />
            }
        </>
    );
}