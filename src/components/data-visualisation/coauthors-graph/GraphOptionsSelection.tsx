'use client'

import Button from '@/components/inputs/Button'
import CheckListButton from '@/components/inputs/CheckListButton'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import GraphExportDialog from '@/components/export/GraphExportDialog'
import { CoauthorsGraphOptions } from '@/dtos/data-visualisation/graphs/CoauthorsGraph'
import { LinkDatum, LinkDatumExtension } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum, NodeDatumExtension } from '@/dtos/data-visualisation/graphs/NodeDatum'
import useDialog from '@/hooks/useDialog'
import { forwardRef } from 'react'
import { MdFilterCenterFocus, MdGetApp, MdSettings } from 'react-icons/md'

type GraphOptionsSelectionParams = {
    id: string,
    options: CoauthorsGraphOptions,
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
export default function GraphOptionsSelection({ id, options, nodes, links, setOptions, zoomToCenter }: GraphOptionsSelectionParams) {
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
                <span className='hidden @lg:inline'>Display options</span>
            </Button>
            <Button
                className='items-center gap-x-2'
                size='xs'
                variant='outline'
                onClick={() => showExportDialog()}>
                <MdGetApp />
                <span className='hidden @lg:inline'>Export graph</span>
            </Button>
            <Button
                variant='icon-outline'
                size='sm'
                onClick={zoomToCenter}
                className='p-0'
                title='Center the graph'>
                <MdFilterCenterFocus className='w-4 h-4' />
            </Button>

            <GraphOptionsDialog
                ref={optionsDialogRef}
                animation={optionsDialogAnimationClass}
                hide={hideOptionsDialog}
                isOpen={isOptionsDialogOpen}
                options={options}
                setOptions={setOptions}
                zoomToCenter={zoomToCenter} />
            <GraphExportDialog
                id={id}
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
            className='dialog sm:max-w-md w-full max-h-[min(25rem,90%)] h-auto'>
            <DialogContent
                className='max-h-full flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Display Options'} />

                <DialogBody
                    className='flex-1 flex flex-col gap-3 items-start'>
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
                    <CheckListButton
                        className='w-full'
                        isSelected={options.showLinkWeightOnHover}
                        onClick={() => setOptions({ showLinkWeightOnHover: !options.showLinkWeightOnHover })}>
                        Show link weights on hover
                    </CheckListButton>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

GraphOptionsDialog.displayName = 'GraphOptionsDialog';