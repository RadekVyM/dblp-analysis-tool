'use client'

import Button from '@/components/inputs/Button'
import ExportButton from '@/components/export/ExportButton'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import useDialog from '@/hooks/useDialog'
import { delay } from '@/utils/promises'
import { useRouter } from 'next/navigation'
import { MdDelete, MdDriveFileRenameOutline } from 'react-icons/md'
import RenameAuthorGroupDialog from './RenameAuthorGroupDialog'

type AuthorGroupButtonsParams = {
    authorGroupId: string,
    authorGroupTitle: string,
    exportedObject: any,
    isLoadingDone: boolean
}

/** Buttons that allow the user to rename, remove and export an author group. */
export function AuthorGroupButtons({ authorGroupId, authorGroupTitle, exportedObject, isLoadingDone }: AuthorGroupButtonsParams) {
    const { removeAuthorGroup, renameAuthorGroup } = useAuthorGroups();
    const [renameDialogRef, isRenameDialogOpen, renameDialogAnimation, showRenameDialog, hideRenameDialog] = useDialog();
    const [removeDialogRef, isRemoveDialogOpen, removeDialogAnimation, showRemoveDialog, hideRemoveDialog] = useDialog();
    const router = useRouter();

    async function remove() {
        router.replace('/');
        await delay(100);
        removeAuthorGroup(authorGroupId);
    }

    async function rename(title: string) {
        renameAuthorGroup(authorGroupId, title);
    }

    return (
        <div
            className='flex gap-x-2'>
            <Button
                variant='outline'
                size='sm'
                onClick={showRenameDialog}
                className='gap-x-2'>
                <MdDriveFileRenameOutline />
                Rename
            </Button>
            <Button
                variant='outline'
                size='sm'
                onClick={showRemoveDialog}
                className='gap-x-2'>
                <MdDelete />
                Remove
            </Button>
            <ExportButton
                disabled={!isLoadingDone}
                exportedObject={exportedObject}
                fileName={`${authorGroupTitle}.json`} />

            <RenameAuthorGroupDialog
                ref={renameDialogRef}
                currentTitle={authorGroupTitle}
                animation={renameDialogAnimation}
                hide={hideRenameDialog}
                rename={rename}
                isOpen={isRenameDialogOpen} />

            <ConfirmDialog
                ref={removeDialogRef}
                animation={removeDialogAnimation}
                hide={hideRemoveDialog}
                isOpen={isRemoveDialogOpen}
                isDestructive
                title='Are you sure?'
                onConfirm={remove}>
                <span>Are you sure you want to remove this group?</span>
            </ConfirmDialog>
        </div>
    )
}