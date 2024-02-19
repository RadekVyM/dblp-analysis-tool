import { LinkDatum } from '@/dtos/data-visualisation/graphs/LinkDatum'
import { NodeDatum } from '@/dtos/data-visualisation/graphs/NodeDatum'
import { prettifyXml } from '@/utils/strings'

export default function exportToGraphML(nodes: Array<NodeDatum>, links: Array<LinkDatum>) {
    const serializer = new XMLSerializer();
    const doc = document.implementation.createDocument('', '', null);
    const root = createRootElement(doc);
    const labelKey = createLabelKeyElement(doc);
    const graph = createGraphElement(doc);

    doc.appendChild(root);
    root.appendChild(labelKey);
    root.appendChild(graph);

    nodes.forEach((node) => {
        const element = createNodeElement(doc, node.id, node.label);
        graph.appendChild(element);
    });

    links.forEach((link) => {
        const source = typeof link.source === 'object' ?
            (link.source as NodeDatum).id :
            link.source.toString();
        const target = typeof link.target === 'object' ?
            (link.target as NodeDatum).id :
            link.target.toString();
        const element = createEdgeElement(doc, source, target);
        graph.appendChild(element);
    });

    return prettifyXml(`<?xml version="1.0" encoding="UTF-8"?>${serializer.serializeToString(doc)}`);
}

function createRootElement(doc: XMLDocument) {
    const root = doc.createElement('graphml');
    root.setAttribute('xmlns', 'http://graphml.graphdrawing.org/xmlns');
    // Not mandatory:
    root.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    root.setAttribute('xsi:schemaLocation', 'http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd');
    return root;
}

function createGraphElement(doc: XMLDocument) {
    const graph = doc.createElement('graph');
    graph.setAttribute('edgedefault', 'undirected');
    return graph;
}

function createNodeElement(doc: XMLDocument, id: string, label: string) {
    const node = doc.createElement('node');
    const labelData = createNodeDataElement(doc, 'label', label);
    node.setAttribute('id', id);
    node.appendChild(labelData);
    return node;
}

function createEdgeElement(doc: XMLDocument, source: string, target: string) {
    const edge = doc.createElement('edge');
    edge.setAttribute('source', source);
    edge.setAttribute('target', target);
    return edge;
}

function createLabelKeyElement(doc: XMLDocument) {
    // <key id="label" for="node" attr.name="label" attr.type="string"/>
    const key = doc.createElement('key');
    key.setAttribute('id', 'label');
    key.setAttribute('for', 'node');
    key.setAttribute('attr.name', 'label');
    key.setAttribute('attr.type', 'string');
    return key;
}

function createNodeDataElement(doc: XMLDocument, key: string, content: string) {
    const data = doc.createElement('data');
    const text = doc.createTextNode(content);
    data.setAttribute('key', key);
    data.append(text);
    return data;
}