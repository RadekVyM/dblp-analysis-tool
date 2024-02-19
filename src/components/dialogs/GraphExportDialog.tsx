'use client'

import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import { LinkDatum, LinkDatumExtension } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum, NodeDatumExtension } from '@/dtos/data-visualisation/graphs/NodeDatum'
import { GraphExportFormat } from '@/enums/GraphExportFormat'
import exportToGDF from '@/services/graphs/export/exportToGDF'
import exportToGEXF from '@/services/graphs/export/exportToGEXF'
import exportToGML from '@/services/graphs/export/exportToGML'
import exportToGraphML from '@/services/graphs/export/exportToGraphML'
import exportToGraphViz from '@/services/graphs/export/exportToGraphViz'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../Button'
import ComboBox from '../ComboBox'
import { MdCheckCircle, MdFileCopy, MdGetApp } from 'react-icons/md'
import { delay } from '@/utils/promises'
import CheckListButton from '../CheckListButton'

type GraphExportDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
    nodes: Array<NodeDatum & NodeDatumExtension>,
    links: Array<LinkDatum & LinkDatumExtension>
}

type CopyToClipboardButtonParams = {
    exportedGraph: string
}

type GraphExportFormatValues = {
    label: string,
    extension: string,
    export: (nodes: Array<NodeDatum>, links: Array<LinkDatum>) => string
}

const formatsMap = new Map<GraphExportFormat, GraphExportFormatValues>([
    [GraphExportFormat.GraphViz, { label: 'GraphViz (.dot)', extension: 'dot', export: exportToGraphViz }],
    [GraphExportFormat.GDF, { label: 'GDF (.gdf)', extension: 'gdf', export: exportToGDF }],
    [GraphExportFormat.GML, { label: 'GML (.gml)', extension: 'gml', export: exportToGML }],
    [GraphExportFormat.GraphML, { label: 'GraphML (.graphml)', extension: 'graphml', export: exportToGraphML }],
    [GraphExportFormat.GEXF, { label: 'GEXF (.gexf)', extension: 'gexf', export: exportToGEXF }],
])

/** Dialog for exporting a coauthors graph to various formats. */
const GraphExportDialog = forwardRef<HTMLDialogElement, GraphExportDialogParams>(({ hide, animation, isOpen, nodes, links }, ref) => {
    const preRef = useRef<HTMLPreElement>(null);
    const [includeOnlyVisible, setIncludeOnlyVisible] = useState(true);
    const [selectedFormat, setSelectedFormat] = useState<GraphExportFormat>(GraphExportFormat.GraphViz);
    const exportedGraph = useMemo(() => {
        if (!isOpen) {
            return '';
        }

        const exportedNodes = includeOnlyVisible ? nodes.filter((n) => n.isVisible) : nodes;
        const exportedLinks = includeOnlyVisible ? links.filter((l) => l.isVisible) : links;

        const format = formatsMap.get(selectedFormat);
        return format?.export(exportedNodes, exportedLinks) || '';
    }, [selectedFormat, includeOnlyVisible, nodes, links, isOpen]);
    const file = useMemo(() => textToFile(exportedGraph, 'text/plain'), [exportedGraph]);
    const currentFormat = formatsMap.get(selectedFormat);

    useEffect(() => {
        preRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [selectedFormat]);

    useEffect(() => {
        if (isOpen) {
            setSelectedFormat(GraphExportFormat.GraphViz);
        }
    }, [isOpen]);

    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog z-20 max-w-3xl max-h-[40rem] w-full h-full flex-dialog overflow-y-hidden'>
            <DialogContent
                className='max-h-[40rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Export Graph'}>
                    <ComboBox
                        id='graph-format-combobox'
                        items={[...formatsMap].map(([key, format]) => ({ key: key, label: format.label }))}
                        selectedKey={selectedFormat}
                        onKeySelectionChange={(key) => setSelectedFormat(key as GraphExportFormat)} />
                    <CheckListButton
                        className='w-full'
                        isSelected={includeOnlyVisible}
                        onClick={() => setIncludeOnlyVisible((old) => !old)}>
                        Include only visible nodes
                    </CheckListButton>
                </DialogHeader>

                <DialogBody
                    className='py-2'>
                    <pre
                        ref={preRef}
                        className='h-full overflow-auto thin-scrollbar bg-surface-container text-on-surface-container border border-outline rounded-lg p-4'>
                        {exportedGraph}
                    </pre>
                </DialogBody>

                <footer
                    className='px-6 pb-6 pt-2 self-stretch flex'>
                    <span className='flex-1'>{fileSizeToText(file.size)}</span>

                    <div
                        className='flex gap-x-2'>
                        <CopyToClipboardButton
                            exportedGraph={exportedGraph} />
                        <Button
                            href={file.url}
                            download={`graph.${currentFormat?.extension || 'txt'}`}
                            target='_blank'
                            className='items-center gap-x-2'>
                            <MdGetApp />
                            Download
                        </Button>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    )
});

GraphExportDialog.displayName = 'GraphExportDialog';
export default GraphExportDialog;

function CopyToClipboardButton({ exportedGraph }: CopyToClipboardButtonParams) {
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setSuccess(false);
    }, [exportedGraph]);

    return (
        <Button
            variant='outline'
            onClick={async () => {
                await navigator.clipboard.writeText(exportedGraph);
                setSuccess(true);
                await delay(2000);
                setSuccess(false);
            }}
            className='items-center gap-x-2'>
            {success ? <MdCheckCircle /> : <MdFileCopy />}
            Copy to clipboard
        </Button>
    )
}

function textToFile(text: string, type: string) {
    const file = new Blob([text], { type: type });
    return { url: URL.createObjectURL(file), size: file.size };
}
function fileSizeToText(bytes: number) {
    const kilo = bytes / 1024;

    if (kilo < 1024) {
        return kilo.toLocaleString(undefined, { style: 'unit', unit: 'kilobyte', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return (kilo / 1024).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}