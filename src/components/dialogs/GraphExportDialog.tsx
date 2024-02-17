'use client'

import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import { LinkDatum, LinkDatumExtension } from '@/dtos/graphs/LinkDatum'
import { NodeDatum, NodeDatumExtension } from '@/dtos/graphs/NodeDatum'
import exportToGraphViz from '@/services/graphs/export/exportToGraphViz'
import { forwardRef, useState } from 'react'
import Button from '../Button'
import exportToGDF from '@/services/graphs/export/exportToGDF'

type GraphExportDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
    nodes: Array<NodeDatum & NodeDatumExtension>,
    links: Array<LinkDatum & LinkDatumExtension>
}

/** Dialog for exporting a coauthors graph to different formats. */
const GraphExportDialog = forwardRef<HTMLDialogElement, GraphExportDialogParams>(({ hide, animation, isOpen, nodes, links }, ref) => {
    const [exportedGraph, setExportedGraph] = useState('');

    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog z-20 max-w-2xl w-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[40rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Export Data'} />

                <DialogBody
                    className='flex flex-col gap-3 items-start'>
                    <div
                        className='flex gap-x-2'>
                        <Button
                            onClick={async () => await navigator.clipboard.writeText(exportedGraph)}>
                            Copy to clipboard
                        </Button>
                        <Button
                            onClick={() => setExportedGraph(exportToGraphViz(nodes, links))}>
                            GraphViz
                        </Button>
                        <Button
                            onClick={() => setExportedGraph(exportToGDF(nodes, links))}>
                            GDF
                        </Button>
                    </div>

                    <div className='overflow-auto self-stretch flex-1'>
                        <pre>{exportedGraph}</pre>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
});

GraphExportDialog.displayName = 'GraphExportDialog';
export default GraphExportDialog;