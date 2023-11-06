'use client'

import Button from '@/components/Button'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useDialog from '@/hooks/useDialog'
import { cn } from '@/utils/tailwindUtils'
import { useEffect, useState } from 'react'
import { MdBookmarks, MdLibraryAdd } from 'react-icons/md'
import { AddToGroupDialog } from './AddToGroupDialog'

type SaveButtonsParams = {
    className?: string,
    authorId: string,
    title: string
}

export default function SaveButtons({ className, authorId, title }: SaveButtonsParams) {
    const [isSaved, setIsSaved] = useState<boolean>();
    const { removeSavedAuthor, saveAuthor, savedAuthors, error } = useSavedAuthors();

    // TODO: Handle errors

    useEffect(() => {
        setIsSaved(!!savedAuthors.find((a) => a.id == authorId));
    }, [savedAuthors, authorId]);

    function updateSaved() {
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
                onClick={() => updateSaved()}>
                <MdBookmarks />
                <span className='hidden xs:block'>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            <GroupButton />
        </div>
    )
}

function GroupButton() {
    const [dialogRef, isDialogOpen, dialogAnimationClass, showDialog, hideDialog] = useDialog();

    return (
        <>
            <Button
                variant='outline' size='sm'
                className='items-center gap-x-2'
                onClick={showDialog}>
                <MdLibraryAdd />
                <span className='hidden xs:block'>Add to group</span>
            </Button>
            <AddToGroupDialog
                hide={hideDialog}
                animation={dialogAnimationClass}
                isOpen={isDialogOpen}
                ref={dialogRef} />
        </>
    )
}