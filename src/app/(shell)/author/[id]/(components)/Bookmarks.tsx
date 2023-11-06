'use client'

import Button from '@/components/Button'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import { cn } from '@/utils/tailwindUtils'
import { useEffect, useState } from 'react'
import { MdBookmarks, MdLibraryAdd } from 'react-icons/md'

type BookmarksParams = {
    className?: string,
    authorId: string,
    title: string
}

export default function Bookmarks({ className, authorId, title }: BookmarksParams) {
    const [isSaved, setIsBookmarked] = useState<boolean>();
    const { removeSavedAuthor, saveAuthor, savedAuthors } = useSavedAuthors();

    useEffect(() => {
        setIsBookmarked(!!savedAuthors.find((a) => a.id == authorId));
    }, [savedAuthors, authorId]);

    function updateBookmark() {
        if (isSaved) {
            removeSavedAuthor(authorId);
        }
        else {
            saveAuthor(authorId, title);
        }
    }

    return (
        <div className={cn('flex gap-2', className)}>
            <Button
                variant={isSaved ? 'default' : 'outline'}
                size='sm'
                className='items-center gap-x-2'
                onClick={() => updateBookmark()}>
                <MdBookmarks />
                <span className='hidden xs:block'>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            <Button
                variant='outline' size='sm'
                className='items-center gap-x-2'
                onClick={() => { }}>
                <MdLibraryAdd />
                <span className='hidden xs:block'>Add to group</span>
            </Button>
        </div>
    )
}