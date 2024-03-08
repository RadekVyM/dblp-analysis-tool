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
import useFullscreen from '@/hooks/useFullscreen'
import GraphStats from './GrapStats'
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md'
import CoauthorsGraphInfoButton from './CoauthorsGraphInfoButton'
import filterPublications from '@/services/publications/filters'

type CoauthorsGraphShellParams = {
    id: string,
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
    className?: string
}

type ShouldRenderGraphParams = {
    onRenderItClick: () => void
}

const GRAPH_IS_HUGE_SINCE_NODES_COUNT = 2500;
const GRAPH_IS_HUGE_SINCE_LINKS_COUNT = 5000;

/** Shell for the entire coauthors graph and its menus. */
export default function CoauthorsGraphShell({ id, authors, publications, className }: CoauthorsGraphShellParams) {
    const rootRef = useRef<HTMLDivElement>(null);
    // Additional authors are authors whose all coauthors are included in the graph
    const { additionalAuthors, addAdditionalAuthor, removeAdditionalAuthor, allAuthors } = useAuthors(authors, publications);
    const graphRef = useRef<CoauthorsGraphRef | null>(null);
    const [graph, updateGraph] = useCoauthorsGraph(allAuthors);
    const selectedAuthor = useMemo(
        () => graph.selectedAuthorId ? graph.authorsMap.get(graph.selectedAuthorId) : undefined,
        [graph.selectedAuthorId, graph.authorsMap]);
    const displayedNodes = useMemo(
        () => graph.nodes.filter((a) => a.isVisible),
        // Dependency array contains all properties that modify the isVisible property of nodes
        [graph.nodes, graph.filteredAuthorsIds, graph.searchQuery, graph.originalAuthorsAlwaysIncluded, graph.intersectionOfCoauthors, graph.onlyCommonCoauthors, authors]);
    const { filtersMap, switchSelection, clear } = useFilters(
        allAuthors.publications,
        (authorsIds) => updateGraph({ filteredAuthorsIds: authorsIds }));
    const isGraphHuge = useMemo(
        () => graph.nodes.length > GRAPH_IS_HUGE_SINCE_NODES_COUNT || graph.links.length > GRAPH_IS_HUGE_SINCE_LINKS_COUNT,
        [graph.nodes.length, graph.links.length]);
    const [shouldRenderGraph, setShouldRenderGraph] = useState(false);
    const { isFullscreen, isFullscreenEnabled, toggleFullscreen } = useFullscreen(rootRef);

    useEffect(() => {
        if (graph.nodes.length !== 0) {
            setShouldRenderGraph(!isGraphHuge);
        }
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
            ref={rootRef}
            className={cn(
                'relative grid gap-3',
                'grid-rows-[0.75fr_auto_1fr] grid-cols-[1fr] h-[100vh] max-h-[max(100vh,40rem)]',
                'sm:grid-rows-[1fr_auto] sm:grid-cols-[1fr_minmax(auto,18rem)] sm:h-[100vh] sm:min-h-[30rem] sm:max-h-[min(80vh,40rem)]',
                isFullscreen ? 'p-2 bg-surface lg:grid-cols-[1fr_minmax(auto,20rem)]' : '',
                className)}>
            <DataVisualisationContainer
                className='overflow-hidden w-full h-full'>
                {
                    allAuthors.publications.length === 0 || graph.nodes.length === 0 ?
                        <div
                            className='w-full h-full grid place-content-center'>
                            <span className='text-on-surface-muted text-sm'>No authors found</span>
                        </div> :
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
                <div
                    className='@container flex flex-1 gap-x-2'>
                    <GraphOptionsSelection
                        id={id}
                        nodes={graph.nodes}
                        links={graph.links}
                        options={graph}
                        setOptions={updateGraph}
                        zoomToCenter={() => graphRef.current?.zoomToCenter()} />

                    {
                        isFullscreenEnabled &&
                        <Button
                            size='sm'
                            variant='icon-outline'
                            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            onClick={toggleFullscreen}
                            className='p-0'>
                            {isFullscreen ? <MdFullscreenExit className='w-5 h-5' /> : <MdFullscreen className='w-5 h-5' />}
                        </Button>
                    }

                    <CoauthorsGraphInfoButton />
                </div>

                <GraphStats
                    className='mr-2'
                    nodesCount={graph.nodes.length}
                    linksCount={graph.links.length} />
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
                            popoverContainerRef={rootRef}
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
                            title={`All Authors`}
                            onAuthorHoverChange={onCoauthorHoverChange}
                            isOriginalAuthorsAlwaysIncludedOptionVisible={allAuthors.ids.length > 0}
                            isOnlyCommonCoauthorsOptionVisible={allAuthors.ids.length > 1}
                            originalAuthorsAlwaysIncluded={graph.originalAuthorsAlwaysIncluded}
                            toggleOriginalAuthorsAlwaysIncluded={() => updateGraph({ originalAuthorsAlwaysIncluded: !graph.originalAuthorsAlwaysIncluded })}
                            onlyCommonCoauthors={graph.onlyCommonCoauthors}
                            toggleOnlyCommonCoauthors={() => updateGraph({ onlyCommonCoauthors: !graph.onlyCommonCoauthors })}
                            intersectionOfCoauthors={graph.intersectionOfCoauthors}
                            toggleIntersectionOfCoauthors={() => updateGraph({ intersectionOfCoauthors: !graph.intersectionOfCoauthors })}
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
    const { filtersMap, typesFilter, venuesFilter, yearsFilter, authorsFilter, switchSelection, clear } = usePublicationFilters(
        publications,
        {
            typeFilter: 'Select only authors of publications of certain type',
            venueFilter: 'Select only authors that contribute to certain venues',
            yearFilter: 'Select only authors that published a publication in a certain year',
            authorFilter: 'Select only specified authors'
        });

    useEffect(() => {
        if (!typesFilter || !venuesFilter || !yearsFilter || !authorsFilter) {
            return;
        }

        const selectedTypes = typesFilter.selectedItems;
        const selectedVenues = venuesFilter.selectedItems;
        const selectedYears = yearsFilter.selectedItems;
        const selectedAuthors = authorsFilter.selectedItems;

        const publs = filterPublications(publications, selectedTypes, selectedVenues, selectedYears);
        const authorsIds = new Set<string>();

        publs.forEach(p => [...p.authors, ...p.editors].forEach(a => {
            if (selectedAuthors.size === 0 || selectedAuthors.has(a.id)) {
                authorsIds.add(a.id);
            }
        }));

        onFilteredAuthorsIdsChange(authorsIds);
    }, [publications, typesFilter, venuesFilter, yearsFilter, authorsFilter]);

    return { filtersMap, switchSelection, clear };
}