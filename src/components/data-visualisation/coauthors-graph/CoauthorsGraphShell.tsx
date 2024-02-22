'use client'

import { cn } from '@/utils/tailwindUtils'
import DataVisualisationContainer from '../DataVisualisationContainer'
import CoauthorsGraph, { CoauthorsGraphRef } from './CoauthorsGraph'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SelectedAuthor from './SelectedAuthor'
import AuthorsList from './AuthorsList'
import GraphOptionsSelection from './GraphOptionsSelection'
import useCoauthorsGraph from '@/hooks/data-visualisation/useCoauthorsGraph'
import usePublicationFilters from '@/hooks/filters/usePublicationFilters'
import { DblpPublication } from '@/dtos/DblpPublication'
import Button from '@/components/Button'

type CoauthorsGraphShellParams = {
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
    className?: string
}

type ShouldRenderGraphParams = {
    onRenderItClick: () => void
}

/** Shell for the entire coauthors graph and its menus. */
export default function CoauthorsGraphShell({ authors, publications, className }: CoauthorsGraphShellParams) {
    // Additional authors are authors whose all coauthors are included in the graph
    const { additionalAuthors, addAdditionalAuthor, removeAdditionalAuthor, allAuthors } = useAuthors(authors, publications);
    const graphRef = useRef<CoauthorsGraphRef | null>(null);
    const [graph, updateGraph] = useCoauthorsGraph(allAuthors);
    const selectedAuthor = useMemo(
        () => graph.selectedAuthorId ? graph.authorsMap.get(graph.selectedAuthorId) : undefined,
        [graph.selectedAuthorId, graph.authorsMap]);
    const ignoredAuthorIds = useMemo(() => authors.map((a) => a.id), [authors]);
    // Original authors are excluded
    const displayedNodes = useMemo(
        () => graph.nodes.filter((a) => a.isVisible),
        [graph.nodes, graph.filteredAuthorsIds, graph.searchQuery, authors]);
    const { filtersMap, switchSelection, clear } = useFilters(
        allAuthors.publications,
        (authorsIds) => updateGraph({ filteredAuthorsIds: authorsIds }));
    const isGraphHuge = useMemo(() => graph.nodes.length > 2000, [graph.nodes.length]);
    const [shouldRenderGraph, setShouldRenderGraph] = useState(false);

    useEffect(() => {
        setShouldRenderGraph(!isGraphHuge);
    }, [isGraphHuge, graph.nodes.length]);

    function setSelectedAuthorId(id: string | null) {
        updateGraph({ selectedAuthorId: id });
    }

    function onBackClick() {
        updateGraph({ selectedAuthorId: null });
    }

    function onCoauthorHoverChange(id: string | null, isHovered: boolean) {
        updateGraph((oldGraph) => {
            let newHoveredId: string | null = null;

            if (isHovered || !id) {
                newHoveredId = id;
            }
            else {
                newHoveredId = id === oldGraph.hoveredAuthorId ? null : oldGraph.hoveredAuthorId;
            }

            return {
                hoveredAuthorId: newHoveredId
            }
        });
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
                {
                    !isGraphHuge || shouldRenderGraph ?
                        <CoauthorsGraph
                            ref={graphRef}
                            className='w-full h-full'
                            graph={graph}
                            onAuthorClick={setSelectedAuthorId}
                            onHoverChange={onCoauthorHoverChange} /> :
                        <ShouldRenderGraph
                            onRenderItClick={() => setShouldRenderGraph(true)} />
                }
            </DataVisualisationContainer>
            <DataVisualisationContainer
                className='sm:row-start-2 sm:row-end-3 sm:col-start-1 sm:col-end-2 px-3 py-3 flex gap-x-2'>
                <GraphOptionsSelection
                    nodesCount={graph.nodes.length}
                    linksCount={graph.links.length}
                    nodes={graph.nodes}
                    links={graph.links}
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
                            allIncludedAuthorIds={allAuthors.ids}
                            originalAuthorIds={allAuthors.originalAuthorsIds}
                            ignoredAuthorIds={ignoredAuthorIds}
                            addAuthor={addAdditionalAuthor}
                            removeAuthor={removeAdditionalAuthor}
                            onCoauthorClick={setSelectedAuthorId}
                            onBackClick={onBackClick}
                            onCoauthorHoverChange={onCoauthorHoverChange} /> :
                        <AuthorsList
                            nodes={displayedNodes}
                            filteredAuthorsIds={graph.filteredAuthorsIds}
                            filtersMap={filtersMap}
                            switchSelection={switchSelection}
                            clear={clear}
                            onAuthorClick={setSelectedAuthorId}
                            title={`All authors`}
                            onAuthorHoverChange={onCoauthorHoverChange}
                            searchQuery={graph.searchQuery}
                            onSearchQueryChange={(newQuery) => updateGraph({ searchQuery: newQuery })} />
                }
            </DataVisualisationContainer>
        </div>
    )
}

function ShouldRenderGraph({ onRenderItClick }: ShouldRenderGraphParams) {
    return (
        <div
            className='px-4 pb-4 pt-5'>
            <h2 className='font-bold mb-4'>This graph is huge!</h2>
            <p>
                Are you sure you want this graph to be rendered?<br />
                It may take a long time, slow your browser and will most likely be pretty useless.
            </p>
            <Button
                className='mt-5'
                size='sm'
                onClick={onRenderItClick}>
                Render it anyway
            </Button>
        </div>
    )
}

/** Hook that handles processed authors. */
function useAuthors(authors: Array<DblpAuthor>, publications?: Array<DblpPublication>) {
    const [additionalAuthors, setAdditionalAuthors] = useState<Array<DblpAuthor>>([]);
    const allAuthors = useMemo(() => {
        const uniquePublications = new Map<string, DblpPublication>();
        authors.forEach((a) => a.publications.forEach((p) => uniquePublications.set(p.id, p)));
        additionalAuthors.forEach((a) => a.publications.forEach((p) => uniquePublications.set(p.id, p)));

        publications?.forEach((p) => uniquePublications.set(p.id, p));

        return {
            originalAuthors: authors,
            originalAuthorsIds: authors.map((a) => a.id),
            publications: [...uniquePublications.values()],
            ids: authors
                .map((a) => a.id)
                .concat(additionalAuthors.map((a) => a.id))
        };
    }, [authors, publications, additionalAuthors]);

    const addAdditionalAuthor = useCallback((author: DblpAuthor) => {
        if (additionalAuthors.some((a) => a.id === author.id)) {
            return;
        }
        setAdditionalAuthors((old) => [...old, author]);
    }, [additionalAuthors, setAdditionalAuthors]);

    const removeAdditionalAuthor = useCallback((id: string) => {
        setAdditionalAuthors((old) => old.filter((a) => a.id !== id));
    }, [setAdditionalAuthors]);

    return { additionalAuthors, allAuthors, addAdditionalAuthor, removeAdditionalAuthor };
}

/** Hook that handles filtering of nodes. */
function useFilters(publications: Array<DblpPublication>, onFilteredAuthorsIdsChange: (ids: Set<string>) => void) {
    const { filtersMap, typesFilter, venuesFilter, switchSelection, clear } = usePublicationFilters(publications);

    useEffect(() => {
        if (!typesFilter || !venuesFilter) {
            return;
        }

        const selectedTypes = typesFilter.selectedItems;
        const selectedVenues = venuesFilter.selectedItems;
        const publs = publications.filter((publ) =>
            (selectedTypes.size == 0 || selectedTypes.has(publ.type)) && (selectedVenues.size == 0 || selectedVenues.has(publ.venueId)));
        const authorsIds = new Set<string>();

        publs.forEach(p => [...p.authors, ...p.editors].forEach(a => {
            authorsIds.add(a.id);
        }));

        onFilteredAuthorsIdsChange(authorsIds);
    }, [publications, typesFilter, venuesFilter]);

    return { filtersMap, switchSelection, clear };
}