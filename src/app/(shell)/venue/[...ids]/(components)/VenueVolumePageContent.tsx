'use client'

import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import VolumesStats from './VolumesStats'
import ExportVenueButton from './ExportVenueButton'

type VenueVolumePageContentParams = {
    venueVolume: DblpVenueVolume,
    venueId: string,
    volumeId?: string,
}

/** Page content of a venue volume or venue that does not have any volumes. */
export default function VenueVolumePageContent({ venueVolume, venueId, volumeId }: VenueVolumePageContentParams) {
    return (
        <>
            <ExportVenueButton
                exportedObject={venueVolume}
                venueTitle={venueVolume.title}
                disabled={!venueVolume} />

            <VolumesStats
                venueVolumeType={venueVolume.venueVolumeType}
                volumes={[venueVolume]}
                venueId={venueId}
                volumeId={volumeId} />
        </>
    )
}