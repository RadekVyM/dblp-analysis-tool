import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

/**
 * Exports a graph to the GraphViz DOT format.
 * 
 * https://gephi.org/users/supported-graph-formats/graphviz-dot-format/
 * @param nodes List of graph nodes
 * @param links List of graph links
 * @returns String containing the graph in the GraphViz DOT format
 */
export default function exportToGraphViz(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const stringLinks = links.map((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();

        return `"${source}" -- "${target}" [weight=${link.weight}]`;
    });
    const stringNodes = nodes.map((node) => `"${node.id}" [label="${node.label}"]`);

    const body = `\t${stringLinks.join(';\n\t')};\n\t${stringNodes.join(';\n\t')};`;

    return `graph dblp {\n${body}\n}`;
}