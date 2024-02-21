'use client'

import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { DblpVenue } from '@/dtos/DblpVenue'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenueVolumeItem } from '@/dtos/DblpVenueVolumeItem'
import { useEffect, useMemo, useState } from 'react'
import VolumesContent from './VolumesContent'
import useVenueVolume from '@/hooks/venues/useVenueVolume'

type VolumesPageContentParams = {
    venue: DblpVenue
}

type VolumeItemsParams = {
    items: Array<DblpVenueVolumeItem>,
    selectedVolumeIds: Set<string>,
    onFetchedVolume: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
}

type VolumeItemParams = {
    item: DblpVenueVolumeItem,
    selectedVolumeIds: Set<string>,
    onFetched: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
}

export default function VolumesPageContent({ venue }: VolumesPageContentParams) {
    const [volumes, setVolumes] = useState<Array<DblpVenueVolume>>([]);
    const [selectedVolumeIds, setSelectedVolumeIds] = useState<Set<string>>(new Set());
    const selectedVolumes = useMemo(() => volumes.filter((v) => selectedVolumeIds.has(v.id)), [volumes, selectedVolumeIds]);

    function toggleVolume(id: string) {
        setSelectedVolumeIds((old) => {
            const newSet = new Set<string>(old);
            if (old.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    function onFetchedVolume(volume: DblpVenueVolume) {
        setVolumes((old) => {
            if (old.some((v) => v.id === volume.id)) {
                return old;
            }
            return [...old, volume];
        });
    }

    return (
        <>
            <VolumeItems
                toggleVolume={toggleVolume}
                selectedVolumeIds={selectedVolumeIds}
                items={venue.volumes}
                onFetchedVolume={onFetchedVolume} />

            {
                volumes.length > 0 &&
                <VolumesContent
                    volumes={selectedVolumes} />
            }
        </>
    )
}

function VolumeItems({ items, selectedVolumeIds, onFetchedVolume, toggleVolume }: VolumeItemsParams) {
    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>Volumes</PageSectionTitle>

            <ul
                className='grid grid-rows-[repeat(auto_1fr)] xs:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-4 gap-y-2'>
                {items.map((item) =>
                    <VolumeItem
                        key={item.volumeId}
                        item={item}
                        selectedVolumeIds={selectedVolumeIds}
                        toggleVolume={toggleVolume}
                        onFetched={onFetchedVolume} />)}
            </ul>
        </PageSection>
    )
}

function VolumeItem({ item, selectedVolumeIds, onFetched, toggleVolume }: VolumeItemParams) {
    const isSelected = selectedVolumeIds.has(item.volumeId);
    const { volume, error, isLoading } = useVenueVolume(item.venueId, item.volumeId, isSelected);

    useEffect(() => {
        if (volume) {
            onFetched(volume);
        }
    }, [volume]);

    return (
        <li
            className='p-4 min-w-0 row-span-2 grid grid-rows-subgrid
                bg-surface-container rounded-lg border border-outline'>
            <header>
                <h4 className='font-semibold text-on-surface'>{item.title}</h4>
            </header>
            <div>
                <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => toggleVolume(item.volumeId)}
                    className='accent-on-surface-container w-4 h-4 self-end' />
            </div>
        </li>
    )
}