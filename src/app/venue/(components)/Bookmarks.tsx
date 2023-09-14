'use client'

import Button from '@/app/(components)/Button'
import useLocalBookmarkedVenues from '@/client/hooks/useLocalBookmarkedVenues'
import { cn } from '@/shared/utils/tailwindUtils'
import { useEffect, useState } from 'react'
import { MdBookmarks } from 'react-icons/md'

type BookmarksParams = {
    className?: string,
    venueId: string,
    title: string
}

export default function Bookmarks({ className, venueId, title }: BookmarksParams) {
    const { venues, addBookmarkedVenue, removeBookmarkedVenue } = useLocalBookmarkedVenues();
    const [isBookmarked, setIsBookmarked] = useState<boolean>();

    useEffect(() => {
        setIsBookmarked(!!venues?.bookmarked.find((v) => v.id == venueId));
    }, [venues, venueId]);

    function updateBookmark() {
        if (isBookmarked) {
            removeBookmarkedVenue(venueId);
        }
        else {
            addBookmarkedVenue(venueId, title);
        }
    }

    return (
        <Button
            variant={isBookmarked ? 'default' : 'outline'}
            size='sm'
            className='items-center gap-x-2'
            onClick={() => updateBookmark()}>
            <MdBookmarks />
            <span className={cn('hidden xs:block', className)}>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </Button>
    )
}