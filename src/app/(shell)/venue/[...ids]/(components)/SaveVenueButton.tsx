'use client'

import Button from '@/components/Button'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import useNotifications from '@/hooks/useNotifications'
import { cn } from '@/utils/tailwindUtils'
import { useMemo } from 'react'
import { MdBookmarks } from 'react-icons/md'

type SaveVenueButtonParams = {
    className?: string,
    venueId: string,
    title: string
}

/** Button that allows the user to save a venue for easier access to a list. */
export default function SaveVenueButton({ className, venueId, title }: SaveVenueButtonParams) {
    const { removeSavedVenue, saveVenue, savedVenues } = useSavedVenues();
    const { pushNotification } = useNotifications();
    const isSaved = useMemo(() => savedVenues.some((v) => v.id === venueId), [savedVenues, venueId]);

    function updateSaved() {
        if (isSaved) {
            removeSavedVenue(venueId);
        }
        else {
            saveVenue(venueId, title);
        }
    }

    return (
        <Button
            variant={isSaved ? 'default' : 'outline'}
            size='sm'
            className='items-center gap-x-2'
            onClick={() => updateSaved()}>
            <MdBookmarks />
            <span className={cn('hidden xs:block', className)}>{isSaved ? 'Saved' : 'Save'}</span>
        </Button>
    )
}