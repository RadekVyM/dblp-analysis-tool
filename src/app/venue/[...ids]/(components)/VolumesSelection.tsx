'use client'

import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenueVolumeItem } from '@/dtos/DblpVenueVolumeItem'
import { useEffect, useMemo, useState } from 'react'
import useVenueVolume from '@/hooks/venues/useVenueVolume'
import { DblpVenueVolumeItemGroup } from '@/dtos/DblpVenueVolumeItemGroup'
import ListButton from '@/components/ListButton'
import { cn } from '@/utils/tailwindUtils'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'
import LoadingWheel from '@/components/LoadingWheel'
import Badge from '@/components/Badge'
import Link from 'next/link'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import LinkArrow from '@/components/LinkArrow'
import useShowMore from '@/hooks/useShowMore'
import { isNullOrWhiteSpace } from '@/utils/strings'

const DEFAULT_DISPLAYED_ITEMS_COUNT = 10;
const DEFAULT_DISPLAYED_UNGROUPED_SHORT_ITEMS_COUNT = 24;

type VolumesSelectionParams = {
    title?: string,
    wideItems?: boolean,
    groups: Array<DblpVenueVolumeItemGroup>,
    selectedVolumeIds: Set<string>,
    onFetchedVolume: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
    toggleVolumes: (ids: Array<string>) => void,
}

type VolumeItemParams = {
    title: string,
    venueId: string,
    volumeId: string,
    isSelected: boolean,
    maxTitleLength?: number,
    onFetched: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
}

type VolumeItemGroupParams = {
    group: DblpVenueVolumeItemGroup,
    selectedVolumeIds: Set<string>,
    wideItems?: boolean,
    onFetchedVolume: (volume: DblpVenueVolume) => void,
    toggleVolume: (id: string) => void,
    toggleVolumes: (ids: Array<string>) => void,
}

type LoadingCheckbox = {
    isLoading: boolean,
    isChecked: boolean,
    onChange: () => void
}

/**
 * Displays all the volume groups and allows to select them.
 * Handles fetching of the volumes from the server when they are selected.
 */
export default function VolumesSelection({ groups, selectedVolumeIds, title, wideItems, onFetchedVolume, toggleVolume, toggleVolumes }: VolumesSelectionParams) {
    const isGrouped = groups.some((g) => g.items.length > 1);
    const defaultDisplayedItemsCount = !wideItems && !isGrouped ? DEFAULT_DISPLAYED_UNGROUPED_SHORT_ITEMS_COUNT : DEFAULT_DISPLAYED_ITEMS_COUNT;
    const [displayedCount, expanded, expand, collapse] = useShowMore(defaultDisplayedItemsCount, groups.length);

    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>{title || 'Volumes'}</PageSectionTitle>

            {
                isGrouped ?
                    <ul
                        className='flex flex-col gap-y-2'>
                        {groups.slice(0, displayedCount).map((group) =>
                            <VolumeItemGroup
                                key={group.title || 'undefined'}
                                wideItems={wideItems}
                                group={group}
                                selectedVolumeIds={selectedVolumeIds}
                                toggleVolume={toggleVolume}
                                toggleVolumes={toggleVolumes}
                                onFetchedVolume={onFetchedVolume} />)}
                    </ul> :
                    <ul
                        className={cn(
                            'grid gap-x-4 gap-y-2',
                            !wideItems && 'xs:grid-cols-[repeat(auto-fit,minmax(24rem,1fr))]'
                        )}>
                        {groups.slice(0, displayedCount).map((group) =>
                            <VolumeItem
                                key={group.items[0].volumeId}
                                title={group.items[0].title}
                                venueId={group.items[0].venueId}
                                volumeId={group.items[0].volumeId}
                                isSelected={selectedVolumeIds.has(group.items[0].volumeId)}
                                toggleVolume={toggleVolume}
                                onFetched={onFetchedVolume} />)}
                    </ul>
            }
            {
                groups.length > defaultDisplayedItemsCount &&
                <button
                    className='mx-3 mt-4 text-md hover:underline hover:text-on-surface text-on-surface-muted'
                    onClick={() => expanded ? collapse() : expand()}>
                    {expanded ? 'Show less' : `Show ${groups.length - defaultDisplayedItemsCount} more`}
                </button>
            }
        </PageSection>
    )
}

function VolumeItemGroup({ group, selectedVolumeIds, onFetchedVolume, toggleVolume, toggleVolumes }: VolumeItemGroupParams) {
    const [isExpanded, setIsExpanded] = useState(false);
    const selectedVolumesCount = useMemo(
        () => group.items.reduce((acc, item) =>
            selectedVolumeIds.has(item.volumeId) ? acc + 1 : acc, 0),
        [group, selectedVolumeIds]);
    const id = `selection-volume-${group.title || 'undefined'}`

    if (group.items.length === 1) {
        const item = group.items[0];

        return (
            <VolumeItem
                key={item.volumeId}
                title={item.title !== group.title && !isNullOrWhiteSpace(group.title) ? `${group.title}: ${item.title}` : item.title}
                venueId={item.venueId}
                volumeId={item.volumeId}
                isSelected={selectedVolumeIds.has(item.volumeId)}
                toggleVolume={toggleVolume}
                onFetched={onFetchedVolume} />
        )
    }

    return (
        <li>
            <ListButton
                id={id}
                className='w-full flex flex-row justify-between items-center bg-surface-container border border-outline font-semibold'
                surface='container'
                marker='none'
                onClick={() => setIsExpanded((old) => !old)}>
                <span
                    className='flex gap-3 items-center'>
                    <LoadingCheckbox
                        isChecked={selectedVolumesCount === group.items.length}
                        isLoading={false}
                        onChange={() => toggleVolumes(group.items.map((item) => item.volumeId))} />
                    <span className='text-sm'>{group.title}</span>
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
                role='group'
                aria-labelledby={id}
                className={cn(
                    'mt-3 px-2',
                    'xs:grid-cols-[repeat(auto-fit,24rem)]',
                    'gap-x-4 gap-y-2 mb-3',
                    isExpanded ? 'grid' : 'hidden')}>
                {group.items.map((item) =>
                    <VolumeItem
                        key={item.volumeId}
                        title={item.title}
                        venueId={item.venueId}
                        volumeId={item.volumeId}
                        maxTitleLength={36}
                        isSelected={selectedVolumeIds.has(item.volumeId)}
                        toggleVolume={toggleVolume}
                        onFetched={onFetchedVolume} />)}
            </ul>
        </li>
    )
}

function VolumeItem({ title, venueId, volumeId, isSelected, maxTitleLength, onFetched, toggleVolume }: VolumeItemParams) {
    const { volume, error, isLoading } = useVenueVolume(venueId, volumeId, isSelected);
    const itemTitle = title.slice(0, maxTitleLength).trim();

    useEffect(() => {
        if (volume) {
            onFetched(volume);
        }
    }, [volume, onFetched]);

    return (
        <li
            className='flex items-center gap-x-3 px-3 py-1 bg-surface-container rounded-lg border border-outline'>
            <LoadingCheckbox
                isChecked={isSelected}
                isLoading={isLoading}
                onChange={() => toggleVolume(volumeId)} />
            <Link
                prefetch={false}
                className='link-heading block w-fit text-on-surface-muted hover:text-on-surface transition-colors'
                href={createLocalPath(venueId, SearchType.Venue, volumeId)}
                title={itemTitle.length < title.length ? title : undefined}>
                <span
                    className='inline font-semibold text-on-surface text-sm'>
                    {itemTitle}{itemTitle.length < title.length && '...'}
                </span>
                <LinkArrow
                    className='w-5 h-4 ml-[-0.2rem] mt-[-0.15rem]' />
            </Link>
        </li>
    )
}

function LoadingCheckbox({ isLoading, isChecked, onChange }: LoadingCheckbox) {
    if (isLoading) {
        return (
            <LoadingWheel
                className='w-3 h-3 text-on-surface-container'
                thickness='xs' />
        )
    }

    return (
        <input
            title='Select/Deselect'
            type='checkbox'
            checked={isChecked}
            onChange={onChange}
            className='accent-on-surface-container w-3 h-3'
            onClick={(e) => e.stopPropagation()} />
    )
}