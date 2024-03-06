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
    const volumeGroups = useVolumeGroups(venueVolume, venueId, volumeId);

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

            {
                volumeGroups.length > 0 &&
                <TablesOfContent
                    volumeGroups={volumeGroups}
                    venueVolumeType={venueVolume.venueVolumeType}
                    venueId={venueId}
                    volumeId={volumeId} />
            }
        </>
    )
}

function TablesOfContent({ volumeGroups, venueId, volumeId, venueVolumeType }: TablesOfContentParams) {
    const {
        selectedVolumes,
        selectedVolumeIds,
        toggleVolume,
        toggleVolumes,
        onFetchedVolume
    } = useSelectableFetchableVenueVolumes(volumeGroups, undefined, true);

    return (
        <>
            <VolumesSelection
                title='Tables of Contents'
                wideItems
                toggleVolume={toggleVolume}
                toggleVolumes={toggleVolumes}
                selectedVolumeIds={selectedVolumeIds}
                groups={volumeGroups}
                onFetchedVolume={onFetchedVolume} />

            {
                selectedVolumes.length > 0 &&
                <VolumesStats
                    id='venue-tables-of-content'
                    disablePublicationsLink
                    hideLastAddedPublications
                    venueVolumeType={venueVolumeType}
                    volumes={selectedVolumes}
                    venueId={venueId}
                    volumeId={volumeId}
                    publicationsStatsSectionTitle='Publications of Selected Tables'
                    coauthorsSectionTitle='Authors of Selected Tables'
                    explanationObject='selected tables' />
            }
        </>
    )
}

/**
 * Hook that returns tables of contents as a list of volume groups.
 * This allows to work with tables of contents the same way as with volume groups.
 */
function useVolumeGroups(
    venueVolume: DblpVenueVolume,
    venueId: string,
    volumeId?: string
) {
    return useMemo(() => {
        if (volumeId) {
            return [];
        }

        const volumes = d3.rollup(
            venueVolume.publications.filter((publ) => publ.venueId === venueId && publ.volumeId),
            (publs) => publs.map((publ) => ({
                title: publs.length === 1 ? (publ.groupTitle || publ.title) : publ.title,
                venueId: publ.venueId,
                volumeId: publ.volumeId,
                type: venueVolume.type
            } as DblpVenueVolumeItem)),
            (publ) => publ.groupIndex);

        if (volumes.size === 1) {
            return [...volumes.values()][0].map((item) => ({
                title: item.title,
                items: [item],
            } as DblpVenueVolumeItemGroup));
        }

        const keys = [...volumes.keys()];
        keys.sort((key1, key2) => isGreater(key1, key2));

        return keys.map((key) => ({
            title: venueVolume.publications.find((p) => p.groupIndex === key)?.groupTitle,
            items: volumes.get(key),
        } as DblpVenueVolumeItemGroup));
    }, [venueVolume, venueId, volumeId]);
}