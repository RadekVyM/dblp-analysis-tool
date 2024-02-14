'use client'

import Button from '@/components/Button'
import CheckListButton from '@/components/CheckListButton'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import { CoauthorsGraphOptions } from '@/dtos/CoauthorsGraph'
import useDialog from '@/hooks/useDialog'
import { forwardRef } from 'react'
import { MdGetApp, MdSettings } from 'react-icons/md'

type GraphOptionsSelectionParams = {
    options: CoauthorsGraphOptions,
    nodesCount: number,
    linksCount: number,
    zoomToCenter: () => void,
    setOptions: (options: Partial<CoauthorsGraphOptions>) => void
}

type GraphOptionsDialogParams = {
    hide: () => void,
    setOptions: (options: Partial<CoauthorsGraphOptions>) => void,
    zoomToCenter: () => void,
    options: CoauthorsGraphOptions,
    animation: string,
    isOpen: boolean,
}

type GraphExportDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

export default function GraphOptionsSelection({ options, nodesCount, linksCount, setOptions, zoomToCenter }: GraphOptionsSelectionParams) {
    const [optionsDialogRef, isOptionsDialogOpen, optionsDialogAnimationClass, showOptionsDialog, hideOptionsDialog] = useDialog();
    const [exportDialogRef, isExportDialogOpen, exportDialogAnimationClass, showExportDialog, hideExportDialog] = useDialog();

    return (
        <>
            <Button
                className='items-center gap-x-2'
                size='xs'
                variant='outline'
                onClick={() => showOptionsDialog()}>
                <MdSettings />
                Graph Options
            </Button>
            <Button
                className='items-center gap-x-2'
                size='xs'
                variant='outline'
                onClick={() => showExportDialog()}>
                <MdGetApp />
                Export Data
            </Button>
            <div
                className='flex-1 flex justify-end mr-2'>
                <dl
                    className='grid text-xs grid-cols-[1fr_auto] gap-x-2'>
                    <dt className='font-semibold'>Nodes count: </dt>
                    <dd className='justify-self-end'>{nodesCount}</dd>
                    <dt className='font-semibold'>Links count: </dt>
                    <dd className='justify-self-end'>{linksCount}</dd>
                </dl>
            </div>
            <GraphOptionsDialog
                ref={optionsDialogRef}
                animation={optionsDialogAnimationClass}
                hide={hideOptionsDialog}
                isOpen={isOptionsDialogOpen}
                options={options}
                setOptions={setOptions}
                zoomToCenter={zoomToCenter} />
            <GraphExportDialog
                ref={exportDialogRef}
                hide={hideExportDialog}
                animation={exportDialogAnimationClass}
                isOpen={isExportDialogOpen} />
        </>
    )
}

const GraphOptionsDialog = forwardRef<HTMLDialogElement, GraphOptionsDialogParams>(({ hide, animation, isOpen, options, setOptions, zoomToCenter }, ref) => {
    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog z-20 max-w-sm w-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[40rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Graph Options'} />

                <DialogBody
                    className='flex flex-col gap-3 items-start'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={zoomToCenter}>
                        Center the graph
                    </Button>
                    <CheckListButton
                        className='w-full'
                        isSelected={options.originalLinksDisplayed}
                        onClick={() => setOptions({ originalLinksDisplayed: !options.originalLinksDisplayed })}>
                        Show the original links
                    </CheckListButton>
                    <CheckListButton
                        className='w-full'
                        isSelected={options.justDimInvisibleNodes}
                        onClick={() => setOptions({ justDimInvisibleNodes: !options.justDimInvisibleNodes })}>
                        Just dim invisible nodes
                    </CheckListButton>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

GraphOptionsDialog.displayName = 'GraphOptionsDialog';

const GraphExportDialog = forwardRef<HTMLDialogElement, GraphExportDialogParams>(({ hide, animation, isOpen }, ref) => {
    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog z-20 max-w-sm w-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[40rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Export Data'} />

                <DialogBody
                    className='flex flex-col gap-3 items-start'>

                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

GraphExportDialog.displayName = 'GraphExportDialog';