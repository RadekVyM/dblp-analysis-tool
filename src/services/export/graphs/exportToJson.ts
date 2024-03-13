import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

/**
 * Exports a graph to the JSON format.
 * @param nodes List of graph nodes
 * @param links List of graph links
 * @returns String containing the graph in the JSON format
 */
export default function exportToJson(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const exportedNodes = nodes.map((n) => ({
        id: n.id,
        label: n.label
    }));
    const exportedLinks = links.map((l) => ({
        source: typeof l.source === 'object' ?
            (l.source as NodeDatum).id :
            l.source.toString(),
        target: typeof l.target === 'object' ?
            (l.target as NodeDatum).id :
            l.target.toString(),
        weight: l.weight
    }));

    return JSON.stringify({
        nodes: exportedNodes,
        links: exportedLinks
    }, null, 2);
}