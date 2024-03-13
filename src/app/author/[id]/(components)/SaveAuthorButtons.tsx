'use client'

import Button from '@/components/inputs/Button'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useDialog from '@/hooks/useDialog'
import { cn } from '@/utils/tailwindUtils'
import { useMemo } from 'react'
import { MdBookmarks } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import AddToGroupDialog from './AddToGroupDialog'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import ExportButton from '@/components/export/ExportButton'

type SaveAuthorButtonsParams = {
    className?: string,
    author: DblpAuthor
}

type GroupButtonParams = {
    authorId: string,
    authorName: string
}

/** Buttons that allow the user to save an author for easier access to a list or an author group. */
export default function SaveAuthorButtons({ className, author }: SaveAuthorButtonsParams) {
    const { removeSavedAuthor, saveAuthor, savedAuthors, canUseSavedAuthors } = useSavedAuthors();
    const isSaved = useMemo(() => savedAuthors.some((v) => v.id === author.id), [savedAuthors, author.id]);

    function updateSaved() {
        if (isSaved) {
            removeSavedAuthor(author.id);
        }
        else {
            saveAuthor(author.id, author.name);
        }
    }

    return (
        <div className={cn('flex gap-2', className)}>
            <Button
                disabled={!canUseSavedAuthors}
                variant={canUseSavedAuthors && isSaved ? 'default' : 'outline'}
                size='sm'
                className='items-center gap-x-2'
                onClick={() => updateSaved()}>
                <MdBookmarks />
                <span className='hidden xs:block'>{canUseSavedAuthors && isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            <GroupButton
                authorId={author.id}
                authorName={author.name} />
            <ExportButton
                exportedObject={author}
                fileName={`${author.name}.json`} />
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