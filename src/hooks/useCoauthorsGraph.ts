'use client'

import { DblpPublication, DblpPublicationPerson } from '@/dtos/DblpPublication'
import { CoauthorsGraphState, CoauthorsGraphOptions } from '@/dtos/CoauthorsGraph'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { DblpAuthor } from '@/dtos/DblpAuthor'

const DEFAULT_GRAPH_OPTIONS: CoauthorsGraphOptions = {
    originalLinksDisplayed: true,
    selectedAuthorId: null,
    hoveredAuthorId: null,
    filteredAuthorsIds: new Set()
} as const;

type UpdateGraph = Partial<CoauthorsGraphOptions> | ((oldOptions: CoauthorsGraphOptions) => Partial<CoauthorsGraphOptions>)
type AllAuthors = { originalAuthors: Array<DblpAuthor>, publications: Array<DblpPublication>, ids: Array<string> }

/**
 * Hook that creates a coauthors graph state object from a collection of authors.
 * @param allAuthors Lists of authors, their publications and IDs
 * @returns The coauthors graph state object and a function that can modify it 
 */
export default function useCoauthorsGraph(
    allAuthors: AllAuthors
): [CoauthorsGraphState, (newOptions: UpdateGraph) => void] {
    const graph = useMemo(() =>
        convertToCoauthorsGraph(
            allAuthors.publications,
            [],
            allAuthors.ids),
        [allAuthors]);
    const [coauthorsGraph, updateCoauthorsGraph] = useReducer(
        (oldGraph: CoauthorsGraphState, newGraph: Partial<CoauthorsGraphState>) => {
            if (Object.keys(newGraph).every((key) => (newGraph as any)[key] === (oldGraph as any)[key])) {
                // Do not create a new object if the new values are same as the old ones
                return oldGraph;
            }

            let updatedGraph = {
                ...oldGraph,
                ...newGraph,
            };
            const shouldUpdateLinksAndNodesVisualState = !!(
                newGraph.maxCoauthoredPublicationsCount ||
                newGraph.minCoauthoredPublicationsCount ||
                newGraph.originalLinksDisplayed !== undefined ||
                newGraph.selectedAuthorId !== undefined ||
                newGraph.hoveredAuthorId !== undefined ||
                newGraph.filteredAuthorsIds !== undefined
            );

            // Do not update selection if the graph is recreated (authorsMap is changed)
            if (newGraph.selectedAuthorId !== undefined && !newGraph.authorsMap) {
                setSelectedAuthorId(newGraph.selectedAuthorId, oldGraph, updatedGraph);
            }
            if (newGraph.selectedAuthorId === null && newGraph.authorsMap) {
                // The entire graph has been recreated but I want to keep the stack and selected author
                updatedGraph.selectedCoauthorIdsStack = [...oldGraph.selectedCoauthorIdsStack];
                updatedGraph.selectedAuthorId = oldGraph.selectedAuthorId;
            }

            if (shouldUpdateLinksAndNodesVisualState) {
                updateLinksAndNodesVisualState(updatedGraph, allAuthors);
            }

            return updatedGraph;
        },
        {
            nodes: [],
            links: [],
            minCoauthoredPublicationsCount: 0,
            maxCoauthoredPublicationsCount: 0,
            minCoauthorsCount: 0,
            maxCoauthorsCount: 0,
            authorsMap: new Map<string, PublicationPersonNodeDatum>(),
            selectedCoauthorIdsStack: [],
            ...DEFAULT_GRAPH_OPTIONS
        }
    );

    const publicUpdateCoauthorsGraph = useCallback((newOptions: UpdateGraph) => {
        if (newOptions instanceof Function) {
            updateCoauthorsGraph(newOptions(coauthorsGraph));
        }
        else {
            updateCoauthorsGraph(newOptions);
        }
    }, [coauthorsGraph, updateCoauthorsGraph]);

    useEffect(() => {
        updateCoauthorsGraph({
            ...graph,
            ...DEFAULT_GRAPH_OPTIONS,
            filteredAuthorsIds: new Set(graph.nodes.map((n) => n.person.id))
        });
    }, [graph]);

    function setSelectedAuthorId(id: string | null, oldGraph: CoauthorsGraphState, updatedGraph: CoauthorsGraphState) {
        if (allAuthors.originalAuthors.some((a) => a.id === id) || oldGraph.selectedAuthorId === id) {
            return;
        }

        const newStack: Array<string> = [...oldGraph.selectedCoauthorIdsStack];

        if (id === null) {
            newStack.pop();
        }
        else {
            if (newStack[newStack.length - 1] !== id) {
                newStack.push(id);
            }
        }

        updatedGraph.selectedCoauthorIdsStack = newStack;
        updatedGraph.selectedAuthorId = newStack.length > 0 ? newStack[newStack.length - 1] : null;
    }

    return [coauthorsGraph, publicUpdateCoauthorsGraph];
}

function updateLinksAndNodesVisualState(graph: CoauthorsGraphState, allAuthors: AllAuthors) {
    const ignoredLinksNodeIds = graph.originalLinksDisplayed ? [] : allAuthors.ids;

    for (const link of graph.links) {
        link.intensity = (link.publicationsCount - graph.minCoauthoredPublicationsCount) /
            (graph.maxCoauthoredPublicationsCount - graph.minCoauthoredPublicationsCount);

        const source = typeof link.source === 'object' ?
            link.source as PublicationPersonNodeDatum : // The simulation is not finished yet
            graph.authorsMap.get(link.source?.toString());
        const target = typeof link.target === 'object' ?
            link.target as PublicationPersonNodeDatum : // The simulation is not finished yet
            graph.authorsMap.get(link.target?.toString());

        if (!source || !target) {
            continue;
        }

        const isVisible = ignoredLinksNodeIds.some((id) => source.person.id == id || target.person.id == id);
        const isHighlighted = isNodeHoveredOrSelected(source.person, graph.hoveredAuthorId, graph.selectedAuthorId) ||
            isNodeHoveredOrSelected(target.person, graph.hoveredAuthorId, graph.selectedAuthorId);
        const isDim = !isHighlighted && !!(graph.hoveredAuthorId || graph.selectedAuthorId);

        link.isVisible = !isVisible;
        link.isHighlighted = isHighlighted;
        link.isDim = isDim;
    }

    for (const node of graph.nodes) {
        if (!node.x || !node.y) {
            continue;
        }

        const isDim = !isNodeHighlighted(node, graph.hoveredAuthorId, graph.selectedAuthorId);
        const isSelected = isNodeHoveredOrSelected(node.person, graph.hoveredAuthorId, graph.selectedAuthorId);
        const isVisible = graph.filteredAuthorsIds.has(node.person.id) || !!allAuthors.ids.find((id) => node.person.id === id);

        node.isHighlighted = isSelected;
        node.isDim = isDim;
        node.isVisible = isVisible;
    }
}


/** Determines whether the node should be highlighted in the graph. */
function isNodeHighlighted(node: PublicationPersonNodeDatum, hoveredAuthorId: string | null, selectedAuthorId: string | null) {
    return !(hoveredAuthorId || selectedAuthorId) ||
        (node.person.id === hoveredAuthorId) ||
        (node.person.id === selectedAuthorId) ||
        (hoveredAuthorId && node.coauthorIds.has(hoveredAuthorId)) ||
        (selectedAuthorId && node.coauthorIds.has(selectedAuthorId));
}


function isNodeHoveredOrSelected(
    person: DblpPublicationPerson,
    hoveredAuthorId: string | null,
    selectedAuthorId: string | null
) {
    return (
        person.id === selectedAuthorId ||
        person.id === hoveredAuthorId);
}