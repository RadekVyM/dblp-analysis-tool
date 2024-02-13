'use client'

import { DblpPublication } from '@/dtos/DblpPublication'
import { CoauthorsGraph, CoauthorsGraphOptions } from '@/dtos/CoauthorsGraph'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { DblpAuthor } from '@/dtos/DblpAuthor'

const DEFAULT_GRAPH_OPTIONS: CoauthorsGraphOptions = {
    originalLinksDisplayed: true,
    selectedAuthorId: null,
    hoveredAuthorId: null
} as const;

type UpdateGraph = Partial<CoauthorsGraph> | ((oldOptions: CoauthorsGraph) => Partial<CoauthorsGraph>)
type AllAuthors = { originalAuthors: Array<DblpAuthor>, publications: Array<DblpPublication>, ids: Array<string> }

export default function useCoauthorsGraph(
    allAuthors: AllAuthors
): [CoauthorsGraph, (newOptions: UpdateGraph) => void] {
    const graph = useMemo(() =>
        convertToCoauthorsGraph(
            allAuthors.publications,
            [],
            allAuthors.ids),
        [allAuthors]);
    const [coauthorsGraph, updateCoauthorsGraph] = useReducer(
        (oldGraph: CoauthorsGraph, newGraph: Partial<CoauthorsGraph>) => {
            if (Object.keys(newGraph).every((key) => (newGraph as any)[key] === (oldGraph as any)[key])) {
                return oldGraph;
            }

            let updatedGraph = {
                ...oldGraph,
                ...newGraph,
            };
            let shouldUpdateLinksAndNodesState = false;

            if (newGraph.selectedAuthorId !== undefined) {
                setSelectedAuthorId(newGraph.selectedAuthorId, oldGraph, updatedGraph);
                shouldUpdateLinksAndNodesState = true;
            }

            shouldUpdateLinksAndNodesState = !!(
                newGraph.maxCoauthoredPublicationsCount ||
                newGraph.minCoauthoredPublicationsCount ||
                newGraph.isSimulationRunning === false ||
                newGraph.originalLinksDisplayed !== undefined
            );

            if (shouldUpdateLinksAndNodesState) {
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
            isSimulationRunning: false,
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
            ...DEFAULT_GRAPH_OPTIONS
        });
    }, [graph]);

    function setSelectedAuthorId(id: string | null, oldGraph: CoauthorsGraph, updatedGraph: CoauthorsGraph) {
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

function updateLinksAndNodesVisualState(graph: CoauthorsGraph, allAuthors: AllAuthors) {
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
        link.isVisible = !isVisible;
    }
}