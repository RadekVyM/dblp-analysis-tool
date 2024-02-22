'use client'

import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import { DblpVenue } from '@/dtos/DblpVenue';
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes';
import VolumePublications from './VolumePublications';
import VolumeGroups from './VolumeGroups';

type VenuePublicationsParams = {
    venue: DblpVenue,
    venueId: string,
    volumeId?: string,
}

export default function VenuePublications({ venue }: VenuePublicationsParams) {
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
                <VolumePublications
                    volumes={selectedVolumes} />
            }
        </>
    );
}