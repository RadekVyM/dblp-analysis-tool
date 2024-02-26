'use client'

import Button from '@/components/Button'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useDialog from '@/hooks/useDialog'
import { cn } from '@/utils/tailwindUtils'
import { useMemo } from 'react'
import { MdBookmarks } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import AddToGroupDialog from './AddToGroupDialog'

type SaveAuthorButtonsParams = {
    className?: string,
    authorId: string,
    authorName: string
}

type GroupButtonParams = {
    authorId: string,
    authorName: string
}

/** Buttons that allow the user to save an author for easier access to a list or an author group. */
export default function SaveAuthorButtons({ className, authorId, authorName }: SaveAuthorButtonsParams) {
    const { removeSavedAuthor, saveAuthor, savedAuthors } = useSavedAuthors();
    const isSaved = useMemo(() => savedAuthors.some((v) => v.id === authorId), [savedAuthors, authorId]);

    function updateSaved() {
        if (isSaved) {
            removeSavedAuthor(authorId);
        }
        else {
            saveAuthor(authorId, authorName);
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
            <GroupButton
                authorId={authorId}
                authorName={authorName} />
        </div>
    )
}

/** Button that allows the user to save an author to an author group. */
function GroupButton({ authorId, authorName }: GroupButtonParams) {
    const [dialogRef, isDialogOpen, dialogAnimationClass, showDialog, hideDialog] = useDialog();

    return (
        <>
            <Button
                variant='outline' size='sm'
                className='items-center gap-x-2'
                onClick={showDialog}>
                <FaUsers />
                <span className='hidden xs:block'>Groups</span>
            </Button>
            <AddToGroupDialog
                hide={hideDialog}
                animation={dialogAnimationClass}
                isOpen={isDialogOpen}
                ref={dialogRef}
                authorId={authorId}
                authorName={authorName} />
        </>
    )
}