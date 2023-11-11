'use client'

import Button from '@/components/Button'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import { cn } from '@/utils/tailwindUtils'
import { useEffect, useState } from 'react'
import { MdBookmarks } from 'react-icons/md'

type SaveButtonsParams = {
    className?: string,
    venueId: string,
    title: string
}

export default function SaveButtons({ className, venueId, title }: SaveButtonsParams) {
    const [isSaved, setIsSaved] = useState<boolean>();
    const { removeSavedVenue, saveVenue, savedVenues, error, isMutating } = useSavedVenues();

    // TODO: Handle errors

    useEffect(() => {
        setIsSaved(!!savedVenues.find((v) => v.id == venueId));
    }, [savedVenues, venueId]);

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
            disabled={isMutating}
            variant={isSaved ? 'default' : 'outline'}
            size='sm'
            className='items-center gap-x-2'
            onClick={() => updateSaved()}>
            <MdBookmarks />
            <span className={cn('hidden xs:block', className)}>{isSaved ? 'Saved' : 'Save'}</span>
        </Button>
    )
}