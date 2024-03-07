'use client'

import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import VolumesStats from './VolumesStats'
import ExportVenueButton from './ExportVenueButton'
import * as d3 from 'd3'
import { DblpVenueVolumeItem } from '@/dtos/DblpVenueVolumeItem'
import { DblpVenueVolumeItemGroup } from '@/dtos/DblpVenueVolumeItemGroup'
import { useMemo } from 'react'
import VolumesSelection from './VolumesSelection'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import { isGreater } from '@/utils/array'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { PublicationType } from '@/enums/PublicationType'

type VenueVolumePageContentParams = {
    venueVolume: DblpVenueVolume,
    venueId: string,
    volumeId?: string,
}

type TablesOfContentParams = {
    volumeGroups: Array<DblpVenueVolumeItemGroup>,
    venueVolumeType: VenueVolumeType,
    venueId: string,
    volumeId?: string
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
                id='venue-publications'
                venueVolumeType={venueVolume.venueVolumeType}
                volumes={[venueVolume]}
                venueId={venueId}
                volumeId={volumeId} />
        </>
    )
}