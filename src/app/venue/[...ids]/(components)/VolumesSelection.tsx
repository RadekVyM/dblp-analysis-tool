'use client'

import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenueVolumeItem } from '@/dtos/DblpVenueVolumeItem'
import { useEffect, useMemo, useState } from 'react'
import useVenueVolume from '@/hooks/venues/useVenueVolume'
import { DblpVenueVolumeItemGroup } from '@/dtos/DblpVenueVolumeItemGroup'
import CheckListButton from '@/components/CheckListButton'
import ListButton from '@/components/ListButton'
import { cn } from '@/utils/tailwindUtils'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'
import LoadingWheel from '@/components/LoadingWheel'
import Badge from '@/components/Badge'

type VolumesSelectionParams = {
    groups: Array<DblpVenueVolumeItemGroup>,
    selectedVolumeIds: Set<string>,
    onFetchedVolume: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
}

type VolumeItemParams = {
    item: DblpVenueVolumeItem,
    isSelected: boolean,
    onFetched: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
}

type VolumeItemGroupParams = {
    group: DblpVenueVolumeItemGroup,
    selectedVolumeIds: Set<string>,
    onFetchedVolume: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
}

/**
 * Displays all the volume groups and allows to select them.
 * Handles fetching of the volumes from the server when they are selected.
 */
export default function VolumesSelection({ groups, selectedVolumeIds, onFetchedVolume, toggleVolume }: VolumesSelectionParams) {
    const isGrouped = groups.some((g) => g.items.length > 1);

    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>Volumes</PageSectionTitle>

            {
                isGrouped ?
                    <ul
                        className='flex flex-col gap-y-2'>
                        {groups.map((group) =>
                            <VolumeItemGroup
                                key={group.title || 'undefined'}
                                group={group}
                                selectedVolumeIds={selectedVolumeIds}
                                toggleVolume={toggleVolume}
                                onFetchedVolume={onFetchedVolume} />)}
                    </ul> :
                    <ul
                        className='grid xs:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-4 gap-y-2'>
                        {groups.map((group) =>
                            <VolumeItem
                                key={group.items[0].volumeId}
                                item={group.items[0]}
                                isSelected={selectedVolumeIds.has(group.items[0].volumeId)}
                                toggleVolume={toggleVolume}
                                onFetched={onFetchedVolume} />)}
                    </ul>
            }
        </PageSection>
    )
}

function VolumeItemGroup({ group, selectedVolumeIds, onFetchedVolume, toggleVolume }: VolumeItemGroupParams) {
    const [isExpanded, setIsExpanded] = useState(false);
    const selectedVolumesCount = useMemo(
        () => group.items.reduce((acc, item) =>
            selectedVolumeIds.has(item.volumeId) ? acc + 1 : acc, 0),
        [group, selectedVolumeIds]);

    return (
        <li>
            <ListButton
                className='w-full flex flex-row justify-between items-center bg-surface-container border border-outline'
                surface='container'
                marker='none'
                onClick={() => setIsExpanded((old) => !old)}>
                <span
                    className='flex gap-2 items-center'>
                    {group.title}
                    {
                        selectedVolumesCount > 0 &&
                        <Badge
                            title={`${selectedVolumesCount} selected volumes`}>
                            {selectedVolumesCount}
                        </Badge>
                    }
                </span>
                {
                    isExpanded ?
                        <MdArrowDropUp /> :
                        <MdArrowDropDown />
                }
            </ListButton>
            <ul
                className={cn(
                    'mt-2 px-2',
                    'xs:grid-cols-[repeat(auto-fit,12rem)]',
                    'gap-x-4 gap-y-2 mb-3',
                    isExpanded ? 'grid' : 'hidden')}>
                {group.items.map((item) =>
                    <VolumeItem
                        key={item.volumeId}
                        item={item}
                        isSelected={selectedVolumeIds.has(item.volumeId)}
                        toggleVolume={toggleVolume}
                        onFetched={onFetchedVolume} />)}
            </ul>
        </li>
    )
}

function VolumeItem({ item, isSelected, onFetched, toggleVolume }: VolumeItemParams) {
    const { volume, error, isLoading } = useVenueVolume(item.venueId, item.volumeId, isSelected);

    useEffect(() => {
        if (volume) {
            onFetched(volume);
        }
    }, [volume, onFetched]);

    return (
        <CheckListButton
            isSelected={isSelected}
            disabled={isLoading}
            surface='default'
            onClick={() => toggleVolume(item.volumeId)}
            disabledCheckmark={<LoadingWheel className='w-3 h-3 text-on-surface-container' thickness='xs' />}>
            {item.title}
        </CheckListButton>
    )
}