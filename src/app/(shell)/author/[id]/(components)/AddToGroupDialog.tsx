'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import Button from '@/components/Button'
import { MdClose, MdLibraryAdd } from 'react-icons/md'
import CheckListButton from '@/components/CheckListButton'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import Input from '@/components/forms/Input'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { AuthorGroup } from '@/dtos/SavedAuthors'

type AddToGroupDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
    authorId: string,
    authorName: string
}

type AuthorGroupsParams = {
    authorId: string,
    authorName: string,
    isOpen: boolean
}

type AuthorGroupsListParams = {
    authorGroups: Array<AuthorGroup>,
    authorId: string,
    isMutating: boolean,
    onAuthorGroupClick: (groupId: string, select: boolean) => Promise<void>
}

export const AddToGroupDialog = forwardRef<HTMLDialogElement, AddToGroupDialogParams>(({ hide, animation, isOpen, authorId, authorName }, ref) => {
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
                        Groups
                    </h2>
                    <Button
                        title='Close'
                        variant='icon-outline'
                        onClick={() => hide()}>
                        <MdClose
                            className='w-5 h-5' />
                    </Button>
                </header>

                <AuthorGroups
                    isOpen={isOpen}
                    authorId={authorId}
                    authorName={authorName} />
            </DialogContent>
        </Dialog>
    )
});

AddToGroupDialog.displayName = 'AddToGroupDialog';

function AuthorGroups({ authorId, authorName, isOpen }: AuthorGroupsParams) {
    const { authorGroups, saveAuthorGroup, saveAuthorToGroup, removeAuthorFromGroup, error, isLoading, isMutating } = useAuthorGroups();
    const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsInputVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isInputVisible) {
            inputRef?.current?.focus();
        }
    }, [isInputVisible]);

    async function onAuthorGroupClick(groupId: string, select: boolean) {
        if (select) {
            await saveAuthorToGroup(groupId, authorId, authorName);
        }
        else {
            await removeAuthorFromGroup(groupId, authorId);
        }
    }

    async function newAuthorGroupClick() {
        if (isInputVisible) {
            await saveAuthorGroup(newGroupName);
            setNewGroupName('');
            setIsInputVisible(false);
        }
        else {
            setIsInputVisible(true);
        }
    }

    return (
        <>
            {
                authorGroups && authorGroups.length > 0 ?
                    <AuthorGroupsList
                        authorId={authorId}
                        authorGroups={authorGroups}
                        isMutating={isMutating}
                        onAuthorGroupClick={onAuthorGroupClick} /> :
                    <div className='flex-1 self-center grid place-content-center'>
                        <span className='text-on-surface-container-muted text-sm'>No groups found</span>
                    </div>
            }

            <footer
                className='px-6 pt-2 pb-6 flex gap-2 justify-end'>
                {
                    isInputVisible &&
                    <Input
                        ref={inputRef}
                        id='author-group-name'
                        label='Group name'
                        className='flex-1 min-w-0'
                        inputClassName='min-h-[2.25rem] px-3 py-1'
                        onChange={(e) => setNewGroupName(e.target.value)} />
                }
                <Button
                    disabled={isMutating || (isInputVisible && isNullOrWhiteSpace(newGroupName))}
                    variant='outline'
                    className='items-center gap-x-2 self-end'
                    onClick={newAuthorGroupClick}>
                    <MdLibraryAdd />
                    {isInputVisible ? 'Add' : 'Add new group'}
                </Button>
            </footer>
        </>
    )
}

function AuthorGroupsList({ authorGroups, authorId, isMutating, onAuthorGroupClick }: AuthorGroupsListParams) {
    return (
        <ul
            className='flex-1 flex flex-col gap-2 px-6 py-2 overflow-auto thin-scrollbar'>
            {authorGroups.map((group) => {
                const containsAuthor = !!group.authors.find((a) => a.id === authorId);

                return (<li
                    key={group.id}>
                    <CheckListButton
                        className='w-full'
                        disabled={isMutating}
                        isSelected={containsAuthor}
                        onClick={async () => await onAuthorGroupClick(group.id, !containsAuthor)}>
                        {group.title}
                    </CheckListButton>
                </li>)
            })}
        </ul>
    )
}