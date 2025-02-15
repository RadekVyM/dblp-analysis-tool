/** Format to which a graph can be exported. */
export const GraphExportFormat = {
    SimpleCsv: 'SimpleCsv',
    MatrixCsv: 'MatrixCsv',
    Json: 'Json',
    GraphViz: 'GraphViz',
    GDF: 'GDF',
    GML: 'GML',
    GraphML: 'GraphML',
    GEXF: 'GEXF',
} as const;

/** Format to which a graph can be exported. */
export type GraphExportFormat = keyof typeof GraphExportFormat