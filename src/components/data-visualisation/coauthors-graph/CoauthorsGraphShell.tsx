'use client'

import { cn } from '@/utils/tailwindUtils'
import DataVisualisationContainer from '../DataVisualisationContainer'
import CoauthorsGraph, { CoauthorsGraphRef } from './CoauthorsGraph'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo, useRef, useState } from 'react'
import SelectedAuthor from './SelectedAuthor'
import AuthorsList from './AuthorsList'
import GraphOptionsSelection from './GraphOptionsSelection'
import useCoauthorsGraph from '@/hooks/useCoauthorsGraph'

type CoauthorsGraphShellParams = {
    authors: Array<DblpAuthor>,
    className?: string
}

export default function CoauthorsGraphShell({ authors, className }: CoauthorsGraphShellParams) {
    // Additional authors are authors whose all coauthors are included in the graph
    const [additionalAuthors, setAdditionalAuthors] = useState<Array<DblpAuthor>>([]);
    const allAuthors = useMemo(() => ({
        originalAuthors: authors,
        publications: authors
            .flatMap((a) => a.publications)
            .concat(additionalAuthors.flatMap((a) => a.publications)),
        ids: authors
            .map((a) => a.id)
            .concat(additionalAuthors.map((a) => a.id))
    }), [authors, additionalAuthors]);
    const [graph, updateGraph] = useCoauthorsGraph(allAuthors);
    const selectedAuthor = useMemo(
        () => graph.selectedAuthorId ? graph.authorsMap.get(graph.selectedAuthorId) : undefined,
        [graph.selectedAuthorId, graph.authorsMap]);
    // Original authors are excluded
    const displayedNodesList = useMemo(() => graph.nodes.filter((a) => !authors.some((aa) => aa.id === a.person.id)), [graph.nodes, authors]);
    const graphRef = useRef<CoauthorsGraphRef | null>(null);

    function setSelectedAuthorId(id: string | null) {
        updateGraph({ selectedAuthorId: id });
    }

    function onBackClick() {
        updateGraph({ selectedAuthorId: null });
    }

    function onCoauthorHoverChange(id: string | null, isHovered: boolean) {
        updateGraph((oldGraph) => {
            let newHoverId: string | null = null;

            if (isHovered || !id) {
                newHoverId = id;
            }
            else {
                newHoverId = id === oldGraph.hoveredAuthorId ? null : oldGraph.hoveredAuthorId;
            }

            return {
                hoveredAuthorId: newHoverId
            }
        });
    }

    function addAdditionalAuthor(author: DblpAuthor) {
        if (additionalAuthors.some((a) => a.id === author.id)) {
            return;
        }
        setAdditionalAuthors((old) => [...old, author]);
    }

    function removeAdditionalAuthor(id: string) {
        setAdditionalAuthors((old) => old.filter((a) => a.id !== id));
    }

    return (
        <div
            className={cn(
                'grid gap-3',
                'grid-rows-[0.75fr_auto_1fr] grid-cols-[1fr] h-[100vh] max-h-[max(100vh,40rem)]',
                'sm:grid-rows-[1fr_auto] sm:grid-cols-[1fr_minmax(auto,18rem)] sm:h-[100vh] sm:min-h-[30rem] sm:max-h-[min(80vh,40rem)]',
                className)}>
            <DataVisualisationContainer
                className='overflow-hidden w-full h-full'>
                <CoauthorsGraph
                    ref={graphRef}
                    className='w-full h-full'
                    graph={graph}
                    onAuthorClick={setSelectedAuthorId}
                    onHoverChange={onCoauthorHoverChange} />
            </DataVisualisationContainer>
            <DataVisualisationContainer
                className='sm:row-start-2 sm:row-end-3 sm:col-start-1 sm:col-end-2 px-3 py-3 flex gap-x-2'>
                <GraphOptionsSelection
                    nodesCount={graph.nodes.length}
                    linksCount={graph.links.length}
                    options={graph}
                    setOptions={updateGraph}
                    zoomToCenter={() => graphRef.current?.zoomToCenter()} />
            </DataVisualisationContainer>
            <DataVisualisationContainer
                className='h-full overflow-hidden sm:row-start-1 sm:row-end-3 sm:col-start-2 sm:col-end-3'>
                {
                    selectedAuthor ?
                        <SelectedAuthor
                            selectedAuthor={selectedAuthor}
                            authorsMap={graph.authorsMap}
                            allAuthorIds={allAuthors.ids}
                            addAuthor={addAdditionalAuthor}
                            removeAuthor={removeAdditionalAuthor}
                            onCoauthorClick={setSelectedAuthorId}
                            onBackClick={onBackClick}
                            ignoredAuthorIds={authors.map((a) => a.id)}
                            onCoauthorHoverChange={onCoauthorHoverChange} /> :
                        <AuthorsList
                            nodes={displayedNodesList}
                            onAuthorClick={setSelectedAuthorId}
                            title={`All Coauthors`}
                            onAuthorHoverChange={onCoauthorHoverChange} />
                }
            </DataVisualisationContainer>
        </div>
    )
}