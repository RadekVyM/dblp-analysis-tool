'use client'

import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenueVolumeItemGroup } from '@/dtos/DblpVenueVolumeItemGroup';
import { isNullOrWhiteSpace } from '@/utils/strings';
import { useEffect, useMemo, useState } from 'react'

/**
 * Hook that creates a state and operations for selecting and storing fetched volumes of a venue.
 * @param volumeGroups Venue
 * @returns State and operations for selecting and storing fetched volumes of the venue
 */
export default function useSelectableFetchableVenueVolumes(
    volumeGroups: Array<DblpVenueVolumeItemGroup>,
    defaultSelectedVolumeIds?: Array<string>,
    disableSearchParamsUpdate?: boolean
) {
    const [volumes, setVolumes] = useState<Array<DblpVenueVolume>>([]);
    const [selectedVolumeIds, setSelectedVolumeIds] = useState<Set<string>>(new Set());
    const selectedVolumes = useMemo(() => volumes.filter((v) => selectedVolumeIds.has(v.id)), [volumes, selectedVolumeIds]);

    useEffect(() => {
        if (defaultSelectedVolumeIds) {
            setSelectedVolumeIds(new Set([...defaultSelectedVolumeIds]));
            return;
        }
        const firstVolumeId = volumeGroups[0]?.items[0]?.volumeId;
        setSelectedVolumeIds(firstVolumeId ? new Set([firstVolumeId]) : new Set());
    }, [volumeGroups, defaultSelectedVolumeIds]);

    useEffect(() => {
        if (!disableSearchParamsUpdate && typeof window !== 'undefined' && window.history.replaceState) {
            const oldParams = window.location.search.replaceAll('?', '').split('&').filter((p) => !p.startsWith('volumeId=') && !isNullOrWhiteSpace(p));
            const newParams = [...selectedVolumeIds].map((id) => `volumeId=${id}`);
            window.history.replaceState(window.history.state, '', `?${[...oldParams, ...newParams].join('&')}`);
        }
    }, [selectedVolumeIds]);

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

    function toggleVolumes(ids: Array<string>) {
        setSelectedVolumeIds((old) => {
            const newSet = new Set<string>(old);

            if (ids.every((id) => newSet.has(id))) {
                ids.forEach((id) => newSet.delete(id));
            }
            else {
                ids.forEach((id) => newSet.add(id));
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

    return {
        selectedVolumes,
        selectedVolumeIds,
        toggleVolume,
        toggleVolumes,
        onFetchedVolume
    };
}