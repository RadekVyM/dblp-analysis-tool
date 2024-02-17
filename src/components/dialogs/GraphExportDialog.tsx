'use client'

import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import { LinkDatum, LinkDatumExtension } from '@/dtos/graphs/LinkDatum'
import { NodeDatum, NodeDatumExtension } from '@/dtos/graphs/NodeDatum'
import exportToGraphViz from '@/services/graphs/export/exportToGraphViz'
import { forwardRef, useMemo, useState } from 'react'
import Button from '../Button'
import exportToGDF from '@/services/graphs/export/exportToGDF'
import exportToGML from '@/services/graphs/export/exportToGML'
import exportToGraphML from '@/services/graphs/export/exportToGraphML'
import exportToGEXF from '@/services/graphs/export/exportToGEXF'

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
    const fileUrl = useMemo(() => textToFile(exportedGraph, 'text/plain'), [exportedGraph]);

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
                    heading={'Export Data'}>
                    <div
                        className='flex gap-x-2'>
                        <Button
                            onClick={() => setExportedGraph(exportToGraphViz(nodes, links))}>
                            GraphViz
                        </Button>
                        <Button
                            onClick={() => setExportedGraph(exportToGDF(nodes, links))}>
                            GDF
                        </Button>
                        <Button
                            onClick={() => setExportedGraph(exportToGML(nodes, links))}>
                            GML
                        </Button>
                        <Button
                            onClick={() => setExportedGraph(exportToGraphML(nodes, links))}>
                            GraphML
                        </Button>
                        <Button
                            onClick={() => setExportedGraph(exportToGEXF(nodes, links))}>
                            GEXF
                        </Button>
                    </div>
                </DialogHeader>

                <DialogBody>
                    <pre>{exportedGraph}</pre>
                </DialogBody>

                <footer
                    className='px-6 pb-6 pt-2 flex gap-x-2'>
                    <Button
                        href={fileUrl}
                        download={'graph'}
                        target='_blank'>
                        Download
                    </Button>
                    <Button
                        onClick={async () => {
                            await navigator.clipboard.writeText(exportedGraph);
                        }}>
                        Copy to clipboard
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    )
});

GraphExportDialog.displayName = 'GraphExportDialog';
export default GraphExportDialog;

function textToFile(text: string, type: string) {
    const file = new Blob([text], { type: type });
    return URL.createObjectURL(file);
}