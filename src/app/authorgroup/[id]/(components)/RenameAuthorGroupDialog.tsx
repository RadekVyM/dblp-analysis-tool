'use client'

import Button from '@/components/inputs/Button'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import LabeledInput from '@/components/inputs/LabeledInput'
import { ChangeEvent, forwardRef, useState } from 'react'

type RenameAuthorGroupDialogParams = {
    hide: () => void,
    rename: (title: string) => void,
    currentTitle: string,
    animation: string,
    isOpen: boolean
}

/** Dialog for renaming an author group. */
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
                    <form
                        className={'flex flex-col gap-2 items-stretch'}
                        onSubmit={onSubmit}>
                        <LabeledInput
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
                    </form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

RenameAuthorGroupDialog.displayName = 'RenameAuthorGroupDialog';
export default RenameAuthorGroupDialog;