import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

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