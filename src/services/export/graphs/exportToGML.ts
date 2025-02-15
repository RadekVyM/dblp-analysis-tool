import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

/**
 * Exports a graph to the GML format.
 * 
 * https://gephi.org/users/supported-graph-formats/gml-format/
 * @param nodes List of graph nodes
 * @param links List of graph links
 * @returns String containing the graph in the GML format
 */
export default function exportToGML(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const stringLinks = links.map((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();

        return `edge [ source ${source} target ${target} weight ${link.weight} ]`;
    });
    const stringNodes = nodes.map((node) => `node [ id ${node.id} label "${node.label}" ]`);

    const body = `\t${stringNodes.join('\n\t')}\n\t${stringLinks.join('\n\t')}`;

    return `graph\n[\n${body}\n]`;
}