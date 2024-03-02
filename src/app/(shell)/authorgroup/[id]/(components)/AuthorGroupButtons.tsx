'use client'

import Button from '@/components/Button'
import ExportButton from '@/components/ExportButton'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import Form from '@/components/forms/Form'
import Input from '@/components/forms/Input'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import useDialog from '@/hooks/useDialog'
import { delay } from '@/utils/promises'
import { useRouter } from 'next/navigation'
import { ChangeEvent, forwardRef, useState } from 'react'
import { MdDelete, MdDriveFileRenameOutline } from 'react-icons/md'

type AuthorGroupButtonsParams = {
    authorGroupId: string,
    authorGroupTitle: string,
    exportedObject: any,
    isLoadingDone: boolean
}

type RenameAuthorGroupDialogParams = {
    hide: () => void,
    rename: (title: string) => void,
    currentTitle: string,
    animation: string,
    isOpen: boolean
}

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

const RenameAuthorGroupDialog = forwardRef<HTMLDialogElement, RenameAuthorGroupDialogParams>((
    { hide, animation, isOpen, currentTitle, rename },
    ref
) => {
    const [formValues, setFormValues] = useState<{ title: string }>({
        title: currentTitle,
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        rename(formValues.title);
        hide();
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormValues((old) => ({ ...old, [name]: value }));
    }

    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className={'dialog md:max-w-md w-full max-h-[min(15rem,90%)] h-auto'}>
            <DialogContent
                className='max-h-full flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Rename Author Group'} />

                <DialogBody>
                    <Form
                        onSubmit={onSubmit}>
                        <Input
                            className='mb-2'
                            name='title'
                            label='New title'
                            required
                            value={formValues.title}
                            onChange={handleChange} />
                        <Button
                            type='submit'
                            className='self-end'>
                            Rename
                        </Button>
                    </Form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

RenameAuthorGroupDialog.displayName = 'RenameAuthorGroupDialog';