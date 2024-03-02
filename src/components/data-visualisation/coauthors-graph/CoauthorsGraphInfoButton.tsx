'use client'

import Button from '@/components/Button'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import useDialog from '@/hooks/useDialog'
import { forwardRef } from 'react'
import { MdInfo } from 'react-icons/md'

export default function CoauthorsGraphInfoButton() {
    const [dialogRef, isOpen, animation, showDialog, hideDialog] = useDialog();

    return (
        <>
            <Button
                size='sm'
                variant='icon-outline'
                title='Graph info'
                onClick={showDialog}>
                <MdInfo className='w-5 h-5' />
            </Button>

            <CoauthorsGraphInfoDialog
                ref={dialogRef}
                animation={animation}
                isOpen={isOpen}
                hide={hideDialog} />
        </>
    )
}

type CoauthorsGraphInfoDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

const CoauthorsGraphInfoDialog = forwardRef<HTMLDialogElement, CoauthorsGraphInfoDialogParams>((
    { hide, animation, isOpen },
    ref
) => {
    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className={'dialog md:max-w-3xl w-full max-h-[min(40rem,90%)] flex-dialog'}>
            <DialogContent
                className='max-h-full flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading='Coauthorship Graph' />

                <DialogBody
                    className='leading-7'>
                    <p
                        className='mb-5'>
                        This graph consists of all coauthors (and coeditors) of a <dfn className='italic'>publications set</dfn>. In this set, there are all publications by
                        
                        <ul
                            className='list-disc marker:text-primary pl-5 mt-3'>
                            <li>all original authors</li>
                            <li>or all selected volumes of a venue.</li>
                        </ul>
                    </p>

                    <p
                        className='mb-5'>
                        The <dfn className='italic'>original author</dfn> is an author, whose all publications are included in the publications set.
                        The currently displayed individual author and all members of an author group are always considered to be the original authors.
                        Another original authors can be included manually.
                    </p>

                    <p>
                        Each <dfn className='italic'>node</dfn> represents a coauthor of a publication from the publications set.
                        Each <dfn className='italic'>edge</dfn> represents coauthorship.
                        There is an edge between two coauthors only if they are <strong>coauthors of the same publication from the publications set</strong>.
                    </p>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});