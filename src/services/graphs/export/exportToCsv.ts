import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

export function exportToSimpleCsv(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    return links.map((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();
        return `${source};${target}`
    }).join('\n');
}

export function exportToMatrixCsv(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const map = new Map<string, number>();

    links.forEach((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();

        map.set(`${source}${target}`, link.weight);
        map.set(`${target}${source}`, link.weight);
    });

    const header = `;${nodes.map((n) => n.id).join(';')}`;
    const body = nodes
        .map((n1) => `${n1.id};${nodes.map((n2) => map.get(`${n1.id}${n2.id}`)?.toString() || '0').join(';')}`)
        .join('\n');

    return `${header}\n${body}`;
}