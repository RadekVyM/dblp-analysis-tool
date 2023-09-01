'use client'

import Button from '@/app/(components)/Button'
import useLocalBookmarkedAuthors from '@/client/hooks/useLocalBookmarkedAuthors'
import { cn } from '@/shared/utils/tailwindUtils'
import { useEffect, useState } from 'react'
import { MdBookmarks, MdLibraryAdd } from 'react-icons/md'

type BookmarksParams = {
    className?: string,
    authorId: string,
    title: string
}

export default function Bookmarks({ className, authorId, title }: BookmarksParams) {
    const { authors, addBookmarkedAuthor, removeBookmarkedAuthor } = useLocalBookmarkedAuthors();
    const [isBookmarked, setIsBookmarked] = useState<boolean>();

    useEffect(() => {
        setIsBookmarked(!!authors.bookmarked.find((a) => a.id == authorId));
    }, [authors]);

    function updateBookmark() {
        if (isBookmarked) {
            removeBookmarkedAuthor(authorId);
        }
        else {
            addBookmarkedAuthor(authorId, title);
        }
    }

    return (
        <div className={cn('flex gap-2', className)}>
            <Button
                variant={isBookmarked ? 'default' : 'outline'}
                size='sm'
                className='items-center gap-x-2'
                onClick={() => updateBookmark()}>
                <MdBookmarks />
                <span className='hidden xs:block'>Bookmark</span>
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