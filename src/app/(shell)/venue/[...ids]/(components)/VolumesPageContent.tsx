'use client'

import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { DblpVenue } from '@/dtos/DblpVenue'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenueVolumeItem } from '@/dtos/DblpVenueVolumeItem'
import { useEffect, useMemo, useState } from 'react'
import VolumesContent from './VolumesContent'
import useVenueVolume from '@/hooks/venues/useVenueVolume'
import { DblpVenueVolumeItemGroup } from '@/dtos/DblpVenueVolumeItemGroup'
import useShowMore from '@/hooks/useShowMore'

type VolumesPageContentParams = {
    venue: DblpVenue
}

type VolumeGroupsParams = {
    groups: Array<DblpVenueVolumeItemGroup>,
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
            <VolumeGroups
                toggleVolume={toggleVolume}
                selectedVolumeIds={selectedVolumeIds}
                groups={venue.volumeGroups}
                onFetchedVolume={onFetchedVolume} />

            {
                volumes.length > 0 &&
                <VolumesContent
                    volumes={selectedVolumes} />
            }
        </>
    )
}

function VolumeGroups({ groups, selectedVolumeIds, onFetchedVolume, toggleVolume }: VolumeGroupsParams) {
    const isGrouped = groups.some((g) => g.items.length > 1);
    const [displayedCount, isExpanded, expand, collapse] = useShowMore(isGrouped ? 3 : 12, groups.length);

    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>Volumes</PageSectionTitle>

            {
                isGrouped ?
                    <ul
                        className='flex flex-col gap-y-2'>
                        {groups.map((group) =>
                            <li
                                key={group.title || 'undefined'}>
                                <span>{group.title}</span>
                                <ul
                                    className='
                                        grid
                                        grid-cols-[repeat(auto-fill,10rem)]
                                        gap-x-4 gap-y-2'>
                                    {group.items.map((item) =>
                                        <VolumeItem
                                            key={item.volumeId}
                                            item={item}
                                            selectedVolumeIds={selectedVolumeIds}
                                            toggleVolume={toggleVolume}
                                            onFetched={onFetchedVolume} />)}
                                </ul>
                            </li>)}
                    </ul> :
                    <ul
                        className='grid xs:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-4 gap-y-2'>
                        {groups.map((group) =>
                            <VolumeItem
                                key={group.items[0].volumeId}
                                item={group.items[0]}
                                selectedVolumeIds={selectedVolumeIds}
                                toggleVolume={toggleVolume}
                                onFetched={onFetchedVolume} />)}
                    </ul>
            }
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