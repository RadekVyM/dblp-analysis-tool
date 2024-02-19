'use client'

import Button from '@/components/Button'
import CheckListButton from '@/components/CheckListButton'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import GraphExportDialog from '@/components/dialogs/GraphExportDialog'
import { CoauthorsGraphOptions } from '@/dtos/data-visualisation/graphs/CoauthorsGraph'
import { LinkDatum, LinkDatumExtension } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum, NodeDatumExtension } from '@/dtos/data-visualisation/graphs/NodeDatum'
import useDialog from '@/hooks/useDialog'
import { forwardRef } from 'react'
import { MdGetApp, MdSettings } from 'react-icons/md'

type GraphOptionsSelectionParams = {
    options: CoauthorsGraphOptions,
    nodesCount: number,
    linksCount: number,
    nodes: Array<NodeDatum & NodeDatumExtension>,
    links: Array<LinkDatum & LinkDatumExtension>,
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

/** Displays options and actions of the coauthors graph that can specified or invoked. */
export default function GraphOptionsSelection({ options, nodesCount, linksCount, nodes, links, setOptions, zoomToCenter }: GraphOptionsSelectionParams) {
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
                Display Options
            </Button>
            <Button
                className='items-center gap-x-2'
                size='xs'
                variant='outline'
                onClick={() => showExportDialog()}>
                <MdGetApp />
                Export Graph
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
                isOpen={isExportDialogOpen}
                nodes={nodes}
                links={links} />
        </>
    )
}

const GraphOptionsDialog = forwardRef<HTMLDialogElement, GraphOptionsDialogParams>(({ hide, animation, isOpen, options, setOptions, zoomToCenter }, ref) => {
    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog z-20 max-w-md w-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[40rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Display Options'} />

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
                    <CheckListButton
                        className='w-full'
                        isSelected={options.showNeighborLabelsOfHighlightedNodes}
                        onClick={() => setOptions({ showNeighborLabelsOfHighlightedNodes: !options.showNeighborLabelsOfHighlightedNodes })}>
                        Show labels of neighbors of highlighted nodes
                    </CheckListButton>
                    <CheckListButton
                        className='w-full'
                        isSelected={options.alwaysShowLabelsOfOriginalAuthorsNodes}
                        onClick={() => setOptions({ alwaysShowLabelsOfOriginalAuthorsNodes: !options.alwaysShowLabelsOfOriginalAuthorsNodes })}>
                        Always show labels of nodes of original authors
                    </CheckListButton>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

GraphOptionsDialog.displayName = 'GraphOptionsDialog';