'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import Button from '@/components/Button'
import { MdLibraryAdd } from 'react-icons/md'
import CheckListButton from '@/components/CheckListButton'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import Input from '@/components/forms/Input'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import DialogHeader from '@/components/dialogs/DialogHeader'
import DialogBody from '@/components/dialogs/DialogBody'

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
    onAuthorGroupClick: (groupId: string, select: boolean) => void
}

/** Dialog for adding an author to an author group. */
const AddToGroupDialog = forwardRef<HTMLDialogElement, AddToGroupDialogParams>(({ hide, animation, isOpen, authorId, authorName }, ref) => {
    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className='dialog z-20 sm:max-w-lg w-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[25rem] min-h-[16rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Groups'} />

                <AuthorGroups
                    isOpen={isOpen}
                    authorId={authorId}
                    authorName={authorName} />
            </DialogContent>
        </Dialog>
    )
});

AddToGroupDialog.displayName = 'AddToGroupDialog';
export default AddToGroupDialog;

function AuthorGroups({ authorId, authorName, isOpen }: AuthorGroupsParams) {
    const { authorGroups, saveAuthorGroup, saveAuthorToGroup, removeAuthorFromGroup }
        = useAuthorGroups();
    const { inputRef, isInputVisible, newGroupName, setNewGroupName, onNewAuthorGroupClick } = useAuthorGroupInput(isOpen, saveAuthorGroup);

    function onAuthorGroupClick(groupId: string, select: boolean) {
        if (select) {
            saveAuthorToGroup(groupId, authorId, authorName);
        }
        else {
            removeAuthorFromGroup(groupId, authorId);
        }
    }

    return (
        <>
            <DialogBody
                className='py-2'>
                {
                    authorGroups && authorGroups.length > 0 ?
                        <AuthorGroupsList
                            authorId={authorId}
                            authorGroups={authorGroups}
                            onAuthorGroupClick={onAuthorGroupClick} /> :
                        <div className='flex-1 self-center grid place-content-center'>
                            <span className='text-on-surface-container-muted text-sm'>No groups found</span>
                        </div>
                }
            </DialogBody>

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
                    disabled={isInputVisible && isNullOrWhiteSpace(newGroupName)}
                    variant='outline'
                    className='items-center gap-x-2 self-end'
                    onClick={onNewAuthorGroupClick}>
                    <MdLibraryAdd />
                    {isInputVisible ? 'Add' : 'Add new group'}
                </Button>
            </footer>
        </>
    )
}

function AuthorGroupsList({ authorGroups, authorId, onAuthorGroupClick }: AuthorGroupsListParams) {
    return (
        <ul
            className='flex-1 flex flex-col gap-2'>
            {authorGroups.map((group) => {
                const containsAuthor = !!group.authors.find((a) => a.id === authorId);

                return (<li
                    key={group.id}>
                    <CheckListButton
                        className='w-full'
                        isSelected={containsAuthor}
                        onClick={() => onAuthorGroupClick(group.id, !containsAuthor)}>
                        {group.title}
                    </CheckListButton>
                </li>)
            })}
        </ul>
    )
}

/** Hook that creates a state and operations for managing an input for adding a new author group. */
function useAuthorGroupInput(isDialogOpen: boolean, onAddNewAuthorGroup: (newGroupName: string) => void) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        if (!isDialogOpen) {
            setIsInputVisible(false);
        }
    }, [isDialogOpen]);

    useEffect(() => {
        if (isInputVisible) {
            inputRef?.current?.focus();
        }
    }, [isInputVisible]);

    async function onNewAuthorGroupClick() {
        if (isInputVisible) {
            onAddNewAuthorGroup(newGroupName);
            setNewGroupName('');
            setIsInputVisible(false);
        }
        else {
            setIsInputVisible(true);
        }
    }

    return {
        inputRef,
        isInputVisible,
        newGroupName,
        setNewGroupName,
        onNewAuthorGroupClick
    };
}