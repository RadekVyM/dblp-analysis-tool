'use client'

import { forwardRef } from 'react'
import { Dialog, DialogContent } from './Dialog';
import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import Button from '../Button';

type ConfirmDialogParams = {
    hide: () => void,
    animation: string,
    title: React.ReactNode,
    isOpen: boolean,
    isDestructive?: boolean,
    children?: React.ReactNode,
    onConfirm: () => void,
    onDeny?: () => void,
}

const ConfirmDialog = forwardRef<HTMLDialogElement, ConfirmDialogParams>((
    { hide, animation, isOpen, isDestructive, children, title, onConfirm, onDeny },
    ref
) => {
    function onNo() {
        hide();
        if (onDeny) {
            onDeny();
        }
    }

    function onYes() {
        hide();
        onConfirm();
    }

    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className={'dialog md:max-w-md w-full max-h-[min(40rem,90%)] flex-dialog'}>
            <DialogContent
                className='max-h-full flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={title} />

                <DialogBody
                    className='flex flex-col gap-6 items-stretch'>
                    {children}
                    <div
                        className='flex gap-2 self-end'>
                        <Button
                            variant={isDestructive ? 'default' : 'outline'}
                            size='sm'
                            onClick={onNo}>
                            No
                        </Button>
                        <Button
                            size='sm'
                            variant={isDestructive ? 'destructive' : 'default'}
                            onClick={onYes}>
                            Yes
                        </Button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

ConfirmDialog.displayName = 'ConfirmDialog';
export default ConfirmDialog;