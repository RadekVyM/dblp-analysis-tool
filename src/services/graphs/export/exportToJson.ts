import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'

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