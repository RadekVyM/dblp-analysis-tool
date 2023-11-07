'use client'

import { forwardRef } from 'react'
import { Dialog, DialogContent } from '@/components/Dialog'
import Button from '@/components/Button'
import { MdClose, MdLibraryAdd } from 'react-icons/md'
import CheckListButton from '@/components/CheckListButton'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'

type AddToGroupDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean
}

export const AddToGroupDialog = forwardRef<HTMLDialogElement, AddToGroupDialogParams>(({ hide, animation, isOpen }, ref) => {
    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className='dialog z-20 sm:max-w-lg w-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[25rem] min-h-[16rem] flex-1 flex flex-col'>
                <header
                    className='flex justify-between items-center gap-4 px-6 pt-6 pb-2 bg-inherit'>
                    <h2
                        className='text-xl font-semibold'>
                        Add to group
                    </h2>
                    <Button
                        title='Close'
                        variant='icon-outline'
                        onClick={() => hide()}>
                        <MdClose
                            className='w-5 h-5' />
                    </Button>
                </header>

                <GroupsList />
            </DialogContent>
        </Dialog>
    )
});

AddToGroupDialog.displayName = 'AddToGroupDialog';

function GroupsList() {
    const { authorGroups, saveAuthorGroup, error, isLoading } = useAuthorGroups();

    return (
        <>
            <ul
                className='flex-1 flex flex-col gap-2 px-6 py-2 overflow-auto thin-scrollbar'>
                {authorGroups.map((group) =>
                    <li
                        key={group.id}>
                        <CheckListButton
                            isSelected={false}
                            onClick={() => { }}>
                            {group.title}
                        </CheckListButton>
                    </li>)}
            </ul>

            <footer
                className='px-6 pt-2 pb-6 flex justify-end'>
                <Button
                    variant='outline'
                    className='items-center gap-x-2'
                    onClick={() => saveAuthorGroup(`Author group ${authorGroups.length}`)}>
                    <MdLibraryAdd />
                    New group
                </Button>
            </footer>
        </>
    )
}