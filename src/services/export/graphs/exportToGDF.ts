import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

/**
 * Exports a graph to the GDF format.
 * 
 * https://gephi.org/users/supported-graph-formats/gdf-format/
 * @param nodes List of graph nodes
 * @param links List of graph links
 * @returns String containing the graph in the GDF format
 */
export default function exportToGDF(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const nodeDef = 'nodedef> name VARCHAR, label VARCHAR';
    const edgeDef = 'edgedef> node1 VARCHAR, node2 VARCHAR, weight DOUBLE';
    const stringLinks = links.map((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();

        return `${source}, ${target}, ${link.weight}`;
    });
    const stringNodes = nodes.map((node) => `${node.id}, ${node.label}`);

    return `${nodeDef}\n${stringNodes.join('\n')}\n${edgeDef}\n${stringLinks.join('\n')}`;
}