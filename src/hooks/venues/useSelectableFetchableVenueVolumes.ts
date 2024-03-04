'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useEffect, useMemo, useState } from 'react'

/**
 * Hook that creates a state and operations for selecting and storing fetched volumes of a venue.
 * @param venue Venue
 * @returns State and operations for selecting and storing fetched volumes of the venue
 */
export default function useSelectableFetchableVenueVolumes(venue: DblpVenue, defaultSelectedVolumeIds?: Array<string>) {
    const [volumes, setVolumes] = useState<Array<DblpVenueVolume>>([]);
    const [selectedVolumeIds, setSelectedVolumeIds] = useState<Set<string>>(new Set());
    const selectedVolumes = useMemo(() => volumes.filter((v) => selectedVolumeIds.has(v.id)), [volumes, selectedVolumeIds]);

    useEffect(() => {
        if (defaultSelectedVolumeIds) {
            setSelectedVolumeIds(new Set([...defaultSelectedVolumeIds]));
            return;
        }
        const firstVolumeId = venue.volumeGroups[0]?.items[0]?.volumeId;
        setSelectedVolumeIds(firstVolumeId ? new Set([firstVolumeId]) : new Set());
    }, [venue, defaultSelectedVolumeIds]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.history.replaceState) {
            const oldParams = window.location.search.replaceAll('?', '').split('&').filter((p) => !p.startsWith('volumeId='));
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
        onFetchedVolume
    };
}