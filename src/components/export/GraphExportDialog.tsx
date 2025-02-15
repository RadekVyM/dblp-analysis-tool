'use client'

import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogBody from '@/components/dialogs/DialogBody'
import DialogHeader from '@/components/dialogs/DialogHeader'
import { LinkDatum, LinkDatumExtension } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum, NodeDatumExtension } from '@/dtos/data-visualisation/graphs/NodeDatum'
import { GraphExportFormat } from '@/enums/GraphExportFormat'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/inputs/Button'
import ComboBox from '@/components/inputs/ComboBox'
import { MdCheckCircle, MdFileCopy, MdGetApp } from 'react-icons/md'
import { delay } from '@/utils/promises'
import CheckListButton from '@/components/inputs/CheckListButton'
import { exportToGDF, exportToGEXF, exportToGML, exportToGraphML, exportToGraphViz, exportToJson, exportToMatrixCsv, exportToSimpleCsv } from '@/services/export/graphs'
import useTextFile from '@/hooks/useTextFile'
import { useCopyToClipboard } from 'usehooks-ts'

type GraphExportDialogParams = {
    id: string,
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

const FORMATS_MAP = new Map<GraphExportFormat, GraphExportFormatValues>([
    [GraphExportFormat.Json, { label: 'JSON (.json)', extension: 'json', export: exportToJson }],
    [GraphExportFormat.SimpleCsv, { label: 'Simple CSV (.csv)', extension: 'csv', export: exportToSimpleCsv }],
    [GraphExportFormat.MatrixCsv, { label: 'Matrix CSV (.csv)', extension: 'csv', export: exportToMatrixCsv }],
    [GraphExportFormat.GraphViz, { label: 'GraphViz (.dot)', extension: 'dot', export: exportToGraphViz }],
    [GraphExportFormat.GDF, { label: 'GDF (.gdf)', extension: 'gdf', export: exportToGDF }],
    [GraphExportFormat.GML, { label: 'GML (.gml)', extension: 'gml', export: exportToGML }],
    [GraphExportFormat.GraphML, { label: 'GraphML (.graphml)', extension: 'graphml', export: exportToGraphML }],
    [GraphExportFormat.GEXF, { label: 'GEXF (.gexf)', extension: 'gexf', export: exportToGEXF }],
]);

const DEFAULT_FORMAT = GraphExportFormat.Json;
const MAX_NODES_COUNT_FOR_MATRIX_CSV = 4000;
const MAX_PREVIEW_LENGTH = 250000;

/** Dialog for exporting a coauthors graph to various formats. */
const GraphExportDialog = forwardRef<HTMLDialogElement, GraphExportDialogParams>(({ id, hide, animation, isOpen, nodes, links }, ref) => {
    const preRef = useRef<HTMLPreElement>(null);
    const [includeOnlyVisible, setIncludeOnlyVisible] = useState(true);
    const [selectedFormat, setSelectedFormat] = useState<GraphExportFormat>(DEFAULT_FORMAT);
    const exportedGraph = useMemo(() => {
        if (!isOpen) {
            return '';
        }

        const exportedNodes = includeOnlyVisible ? nodes.filter((n) => n.isVisible) : nodes;
        const exportedLinks = includeOnlyVisible ? links.filter((l) => l.isVisible) : links;

        const format = FORMATS_MAP.get(selectedFormat);
        return format?.export(exportedNodes, exportedLinks) || '';
    }, [selectedFormat, includeOnlyVisible, nodes, links, isOpen]);
    const { file, textFileSize } = useTextFile(exportedGraph);
    const printedText = useMemo(() => exportedGraph.substring(0, MAX_PREVIEW_LENGTH), [exportedGraph]);
    const currentFormat = FORMATS_MAP.get(selectedFormat);

    useEffect(() => {
        preRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [selectedFormat]);

    useEffect(() => {
        if (isOpen) {
            setSelectedFormat(DEFAULT_FORMAT);
        }
    }, [isOpen]);

    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog md:max-w-3xl max-h-[min(40rem,90%)] w-full h-full flex-dialog'>
            <DialogContent
                className='max-h-full flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Export Graph'}>
                    <ComboBox
                        id={`${id}-graph-format-combobox`}
                        items={[...FORMATS_MAP]
                            .map(([key, format]) => ({ key: key, label: format.label }))
                            .filter((v) => v.key !== GraphExportFormat.MatrixCsv || nodes.length <= MAX_NODES_COUNT_FOR_MATRIX_CSV)}
                        selectedKey={selectedFormat}
                        onKeySelectionChange={(key) => setSelectedFormat(key as GraphExportFormat)} />
                    <CheckListButton
                        className='w-full'
                        isSelected={includeOnlyVisible}
                        onClick={() => setIncludeOnlyVisible((old) => !old)}>
                        Include only filtered nodes
                    </CheckListButton>
                </DialogHeader>

                <DialogBody
                    className='py-2 flex flex-col'>
                    <h3 className='font-semibold mb-2'>Preview:</h3>
                    <pre
                        ref={preRef}
                        className='flex-1 overflow-auto thin-scrollbar bg-surface-container text-on-surface-container border border-outline rounded-lg p-4'>
                        {printedText}{printedText.length < exportedGraph.length ? '\n...' : ''}
                    </pre>
                </DialogBody>

                <footer
                    className='px-6 pb-6 pt-2 self-stretch flex items-center @container'>
                    <span className='flex-1'>{textFileSize}</span>

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
                            <span className='hidden @sm:inline'>Download</span>
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
    const [copiedValue, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        setSuccess(false);
    }, [exportedGraph]);

    return (
        <Button
            variant='outline'
            onClick={async () => {
                await copyToClipboard(exportedGraph);
                setSuccess(true);
                await delay(2000);
                setSuccess(false);
            }}
            className='items-center gap-x-2'>
            {success ? <MdCheckCircle /> : <MdFileCopy />}
            <span className='hidden @sm:inline'>Copy to clipboard</span>
        </Button>
    )
}