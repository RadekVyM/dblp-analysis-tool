import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'
import { prettifyXml } from '@/utils/strings'

export default function exportToGEXF(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const serializer = new XMLSerializer();
    const doc = document.implementation.createDocument('', '', null);
    const root = createRootElement(doc);
    const graph = createGraphElement(doc);
    const nodesElement = createNodesElement(doc);
    const edgesElement = createEdgesElement(doc);

    doc.appendChild(root);
    root.appendChild(graph);
    graph.appendChild(nodesElement);
    graph.appendChild(edgesElement);

    nodes.forEach((node) => {
        const element = createNodeElement(doc, node.id, node.label);
        nodesElement.appendChild(element);
    });

    links.forEach((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();
        const element = createEdgeElement(doc, source, target);
        edgesElement.appendChild(element);
    });

    return prettifyXml(`<?xml version="1.0" encoding="UTF-8"?>${serializer.serializeToString(doc)}`);
}

function createRootElement(doc: XMLDocument) {
    const root = doc.createElement('gexf');
    root.setAttribute('xmlns', 'http://www.gexf.net/1.3');
    root.setAttribute('version', '1.3');
    // Not mandatory:
    root.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    root.setAttribute('xsi:schemaLocation', 'http://www.gexf.net/1.3 http://www.gexf.net/1.3/gexf.xsd');
    return root;
}

function createGraphElement(doc: XMLDocument) {
    const graph = doc.createElement('graph');
    graph.setAttribute('defaultedgetype', 'undirected');
    return graph;
}

function createNodesElement(doc: XMLDocument) {
    return doc.createElement('nodes');
}

function createEdgesElement(doc: XMLDocument) {
    return doc.createElement('edges');
}

function createNodeElement(doc: XMLDocument, id: string, label: string) {
    const node = doc.createElement('node');
    node.setAttribute('id', id);
    node.setAttribute('label', label);
    return node;
}

function createEdgeElement(doc: XMLDocument, source: string, target: string) {
    const edge = doc.createElement('edge');
    //edge.setAttribute('id', `${source}+${target}`);
    edge.setAttribute('source', source);
    edge.setAttribute('target', target);
    return edge;
}