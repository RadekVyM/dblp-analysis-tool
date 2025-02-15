'use client'

import { DblpPublication, DblpPublicationPerson } from '@/dtos/DblpPublication'
import { CoauthorsGraphState, CoauthorsGraphOptions } from '@/dtos/data-visualisation/graphs/CoauthorsGraph'
import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { convertToCoauthorsGraph, personNodeMatchesSearchPhrases } from '@/services/graphs/authors'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { splitSearchQuery } from '@/utils/strings'

const DEFAULT_GRAPH_OPTIONS: CoauthorsGraphOptions = {
    originalLinksDisplayed: true,
    justDimInvisibleNodes: true,
    showNeighborLabelsOfHighlightedNodes: false,
    alwaysShowLabelsOfOriginalAuthorsNodes: true,
    onlyCommonCoauthors: false,
    intersectionOfCoauthors: false,
    originalAuthorsAlwaysIncluded: true,
    showLinkWeightOnHover: true,
    selectedAuthorId: null,
    hoveredAuthorId: null,
    filteredAuthorsIds: new Set(),
    searchQuery: ''
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

            const updatedGraph = {
                ...oldGraph,
                ...newGraph,
            };

            // Do not update selection if the graph is recreated (authorsMap is changed)
            if (newGraph.selectedAuthorId !== undefined && !newGraph.authorsMap) {
                setSelectedAuthorId(newGraph.selectedAuthorId, oldGraph, updatedGraph);
            }
            if (newGraph.authorsMap) {
                // The entire graph has been recreated
                saveValuesAfterRecreation(updatedGraph, oldGraph, newGraph);
            }

            if (shouldUpdateLinksAndNodesVisualState(newGraph)) {
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
        if (oldGraph.selectedAuthorId === id) {
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

        // If an author is selected, reset the search query
        if (updatedGraph.selectedAuthorId) {
            updatedGraph.searchQuery = '';
        }
    }

    return [coauthorsGraph, publicUpdateCoauthorsGraph];
}

/** Ensures that values of an old graph that need to be saved are copied to an updated graph. */
function saveValuesAfterRecreation(updatedGraph: CoauthorsGraphState, oldGraph: CoauthorsGraphState, newGraph: Partial<CoauthorsGraphState>) {
    if (newGraph.selectedAuthorId === null) {
        // I want to keep the stack and selected author
        updatedGraph.selectedCoauthorIdsStack = [...oldGraph.selectedCoauthorIdsStack];
        updatedGraph.selectedAuthorId = oldGraph.selectedAuthorId;
    }

    updatedGraph.justDimInvisibleNodes = oldGraph.justDimInvisibleNodes;
    updatedGraph.originalLinksDisplayed = oldGraph.originalLinksDisplayed;
    updatedGraph.showNeighborLabelsOfHighlightedNodes = oldGraph.showNeighborLabelsOfHighlightedNodes;
    updatedGraph.alwaysShowLabelsOfOriginalAuthorsNodes = oldGraph.alwaysShowLabelsOfOriginalAuthorsNodes;
}

/** Decides whether the updateLinksAndNodesVisualState() function should be called. */
function shouldUpdateLinksAndNodesVisualState(newGraph: Partial<CoauthorsGraphState>) {
    return !!(newGraph.maxCoauthoredPublicationsCount !== undefined ||
        newGraph.minCoauthoredPublicationsCount !== undefined ||
        newGraph.originalLinksDisplayed !== undefined ||
        newGraph.justDimInvisibleNodes !== undefined ||
        newGraph.showNeighborLabelsOfHighlightedNodes !== undefined ||
        newGraph.alwaysShowLabelsOfOriginalAuthorsNodes !== undefined ||
        newGraph.originalAuthorsAlwaysIncluded !== undefined ||
        newGraph.intersectionOfCoauthors !== undefined ||
        newGraph.onlyCommonCoauthors !== undefined ||
        newGraph.selectedAuthorId !== undefined ||
        newGraph.hoveredAuthorId !== undefined ||
        newGraph.filteredAuthorsIds !== undefined ||
        newGraph.searchQuery !== undefined ||
        newGraph.authorsMap !== undefined);
}

function updateLinksAndNodesVisualState(graph: CoauthorsGraphState, allAuthors: AllAuthors) {
    updateNodesVisualState(graph, allAuthors);
    updateLinksVisualState(graph, allAuthors);
}

function updateNodesVisualState(graph: CoauthorsGraphState, allAuthors: AllAuthors) {
    const searchPhrases = splitSearchQuery(graph.searchQuery);

    for (const node of graph.nodes) {
        const matchesSearchQuery = personNodeMatchesSearchPhrases(node, searchPhrases);
        const isDim = !isNodeHighlighted(node, graph.hoveredAuthorId, graph.selectedAuthorId);
        const isSelected = isNodeHoveredOrSelected(node.person, graph.hoveredAuthorId, graph.selectedAuthorId);
        const isOriginalAuthorNode = allAuthors.ids.some((id) => node.person.id === id);
        const isCommon = !(graph.onlyCommonCoauthors || graph.intersectionOfCoauthors) || allAuthors.ids.length < 2 || isCommonForOriginals(allAuthors, node, graph.intersectionOfCoauthors);
        const isVisible = (isOriginalAuthorNode && graph.originalAuthorsAlwaysIncluded) || (graph.filteredAuthorsIds.has(node.person.id) && matchesSearchQuery && isCommon);
        const isSemiVisible = (!isVisible && isOriginalAuthorNode) || graph.justDimInvisibleNodes && !isVisible;
        const showNeighborLabel = graph.showNeighborLabelsOfHighlightedNodes && (!!(graph.hoveredAuthorId || graph.selectedAuthorId) && !isDim);

        node.isLabelVisible = (graph.alwaysShowLabelsOfOriginalAuthorsNodes && isOriginalAuthorNode) || isSelected || showNeighborLabel;
        node.isHighlighted = isSelected;
        node.isDim = isDim || (!graph.hoveredAuthorId && !graph.selectedAuthorId && isSemiVisible);
        node.isVisible = isVisible;
        node.isOriginalAuthorNode = isOriginalAuthorNode;
    }
}

function updateLinksVisualState(graph: CoauthorsGraphState, allAuthors: AllAuthors) {
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

        const isIgnored = ignoredLinksNodeIds.some((id) => source.person.id == id || target.person.id == id);
        const isVisible = source.isVisible && target.isVisible;
        const isHighlighted = isNodeHoveredOrSelected(source.person, graph.hoveredAuthorId, graph.selectedAuthorId) ||
            isNodeHoveredOrSelected(target.person, graph.hoveredAuthorId, graph.selectedAuthorId);
        const isDim = (!isHighlighted && !!(graph.hoveredAuthorId || graph.selectedAuthorId))
            || (!graph.hoveredAuthorId && !graph.selectedAuthorId && graph.justDimInvisibleNodes && !isVisible);

        link.isIgnored = isIgnored;
        link.isVisible = isVisible;
        link.isHighlighted = isHighlighted;
        link.isDim = isDim;
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

function isCommonForOriginals(allAuthors: AllAuthors, node: PublicationPersonNodeDatum, intersection: boolean): boolean {
    let count = 0;

    for (const id of allAuthors.ids) {
        if (node.coauthorIds.has(id)) {
            count++;
        }
        if (!intersection && count >= 2) {
            return true;
        }
    }

    return allAuthors.ids.length === count;
}