'use client'

import Button from '@/components/Button'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import { cn } from '@/utils/tailwindUtils'
import { useMemo } from 'react'
import { MdBookmarks } from 'react-icons/md'

type SaveVenueButtonParams = {
    className?: string,
    volumeId?: string,
    venueId: string,
    title: string
}

/** Button that allows the user to save a venue for easier access to a list. */
export default function SaveVenueButton({ className, venueId, volumeId, title }: SaveVenueButtonParams) {
    const id = volumeId ? `${venueId}/${volumeId}` : venueId;
    const { removeSavedVenue, saveVenue, savedVenues, canUseSavedVenues } = useSavedVenues();
    const isSaved = useMemo(() => savedVenues.some((v) => v.id === id), [savedVenues, id]);

    function updateSaved() {
        if (isSaved) {
            removeSavedVenue(id);
        }
        else {
            saveVenue(id, title, venueId, volumeId);
        }
    }

    return (
        <Button
            disabled={!canUseSavedVenues}
            variant={canUseSavedVenues && isSaved ? 'default' : 'outline'}
            size='sm'
            className='items-center gap-x-2'
            onClick={() => updateSaved()}>
            <MdBookmarks />
            <span className={cn('hidden xs:block', className)}>{canUseSavedVenues && isSaved ? 'Saved' : 'Save'}</span>
        </Button>
    )
}