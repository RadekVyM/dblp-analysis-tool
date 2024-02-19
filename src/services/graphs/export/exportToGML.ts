import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

export default function exportToGML(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const stringLinks = links.map((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();

        return `edge [ source ${source} target ${target} ]`;
    });
    const stringNodes = nodes.map((node) => `node [ id ${node.id} label "${node.label}" ]`);

    const body = `\t${stringNodes.join('\n\t')}\n\t${stringLinks.join('\n\t')}`;

    return `graph\n[\n${body}\n]`;
}