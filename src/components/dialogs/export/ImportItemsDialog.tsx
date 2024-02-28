'use client'

import { forwardRef } from 'react'
import { Dialog, DialogContent } from '../Dialog'
import DialogHeader from '../DialogHeader'
import DialogBody from '../DialogBody'
import Button from '../../Button'
import { MdGetApp } from 'react-icons/md'
import useTextFile from '@/hooks/useTextFile'

type ImportItemsDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

const ImportItemsDialog = forwardRef<HTMLDialogElement, ImportItemsDialogParams>(({ hide, animation, isOpen }, ref) => {
    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog max-w-3xl max-h-[min(40rem,90%)] w-full h-full flex-dialog'>
            <DialogContent
                className='max-h-full flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Import Items'} />

                <DialogBody
                    className='py-2 flex flex-col'>

                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

ImportItemsDialog.displayName = 'ImportItemsDialog';
export default ImportItemsDialog;