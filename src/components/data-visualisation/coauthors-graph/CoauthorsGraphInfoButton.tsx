'use client'

import Button from '@/components/Button'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import useDialog from '@/hooks/useDialog'
import { cn } from '@/utils/tailwindUtils'
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
                onClick={showDialog}
                className='p-0'>
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
            className={'dialog md:max-w-3xl w-full max-h-[min(40rem,90%)] h-full flex-dialog'}>
            <DialogContent
                className='max-h-full flex-1 flex flex-col min-h-0'>
                <DialogHeader
                    hide={hide}
                    heading='Coauthorship Graph' />

                <DialogBody
                    className='min-h-0 flex-1 leading-7 overflow-auto thin-scrollbar'>
                    <Paragraph
                        className='mb-3'>
                        This graph consists of all coauthors (and coeditors) of a <dfn className='italic'>set of publications</dfn>. This set contains all publications by
                    </Paragraph>

                    <ul
                        className='list-disc marker:text-primary pl-5 mb-5'>
                        <li>all original authors,</li>
                        <li>all selected volumes of a venue</li>
                        <li>or all selected tables of contents of a venue.</li>
                    </ul>

                    <Paragraph>
                        An <dfn className='italic'>original author</dfn> is an author whose all publications are included in the publications set.
                        The currently displayed individual author and all members of an author group are always considered to be original authors.
                        Another original authors can be included manually.
                    </Paragraph>

                    <Paragraph>
                        Each <dfn className='italic'>node</dfn> represents a coauthor of a publication from the publications set.
                        Each <dfn className='italic'>edge</dfn> represents coauthorship.
                        There is an edge between two coauthors only if they are <strong>coauthors of the same publication from the publications set</strong>.
                    </Paragraph>

                    <Paragraph>
                        A value of an edge represents number of common publications that are included in the publications set.
                    </Paragraph>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

CoauthorsGraphInfoDialog.displayName = 'CoauthorsGraphInfoDialog';

function Paragraph({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <p className={cn('mb-5', className)}>{children}</p>
    )
}