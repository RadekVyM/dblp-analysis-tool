'use client'

import { cn } from '@/utils/tailwindUtils'
import DataVisualisationContainer from '../DataVisualisationContainer'
import CoauthorsGraph from './CoauthorsGraph'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo, useState } from 'react'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'
import useGraphOptions from '@/hooks/useGraphOptions'
import SelectedAuthor from './SelectedAuthor'
import AuthorsList from './AuthorsList'
import GraphOptionsSelection from './GraphOptionsSelection'

type CoauthorsGraphShellParams = {
    authors: Array<DblpAuthor>,
    className?: string
}

export default function CoauthorsGraphShell({ authors, className }: CoauthorsGraphShellParams) {
    const [additionalAuthors, setAdditionalAuthors] = useState<Array<DblpAuthor>>([]);
    const allAuthors = useMemo(() => ({
        publications: authors
            .flatMap((a) => a.publications)
            .concat(additionalAuthors.flatMap((a) => a.publications)),
        ids: authors
            .map((a) => a.id)
            .concat(additionalAuthors.map((a) => a.id))
    }), [authors, additionalAuthors]);
    const {
        nodes,
        links,
        authorsMap,
        minCoauthorsCount,
        maxCoauthorsCount,
        minCoauthoredPublicationsCount,
        maxCoauthoredPublicationsCount
    } = useMemo(() =>
        convertToCoauthorsGraph(
            allAuthors.publications,
            [],
            allAuthors.ids),
        [allAuthors]);
    const [graphOptions, setGraphOptions] = useGraphOptions();
    const [hoveredAuthorId, setHoveredAuthorId] = useState<string | null>(null);
    const [selectedCoauthorIdsStack, setSelectedCoauthorIdsStack] = useState<Array<string>>([]);
    const selectedAuthorId = useMemo(() =>
        selectedCoauthorIdsStack.length > 0 ?
            selectedCoauthorIdsStack[selectedCoauthorIdsStack.length - 1] :
            null,
        [selectedCoauthorIdsStack]);
    const selectedAuthor = useMemo(() =>
        selectedAuthorId ? authorsMap.get(selectedAuthorId) : undefined,
        [selectedAuthorId, authorsMap]);
    const nodesList = useMemo(() => nodes.filter((a) => !authors.some((aa) => aa.id === a.person.id)), [nodes, authors]);

    function setSelectedAuthorId(id: string | null) {
        if (authors.some((a) => a.id === id) || selectedAuthorId === id) {
            return
        }

        setSelectedCoauthorIdsStack((old) => {
            if (id === null) {
                old.pop();
            }
            else {
                old.push(id);
            }
            return [...old]
        });
    }

    function onBackClick() {
        setSelectedAuthorId(null);
    }

    function onCoauthorHoverChange(id: string, isHovered: boolean) {
        setHoveredAuthorId((oldId) => {
            if (isHovered) {
                return id
            }
            return id === oldId ? null : oldId
        });
    }

    function addAuthor(author: DblpAuthor) {
        if (additionalAuthors.some((a) => a.id === author.id)) {
            return
        }
        setAdditionalAuthors((old) => [...old, author]);
    }

    function removeAuthor(id: string) {
        setAdditionalAuthors((old) => old.filter((a) => a.id !== id));
    }

    return (
        <div
            className={cn(
                'grid gap-3',
                'grid-rows-[0.75fr_auto_1fr] grid-cols-[1fr] h-[100vh] max-h-[max(100vh,40rem)]',
                'sm:grid-rows-[1fr_auto] sm:grid-cols-[1fr_minmax(auto,18rem)] sm:h-[100vh] sm:min-h-[30rem] sm:max-h-[min(80vh,40rem)]',
                className)}>
            {
                (nodes && nodes.length > 0) ?
                    <DataVisualisationContainer
                        className='overflow-hidden w-full h-full'>
                        <CoauthorsGraph
                            className='w-full h-full'
                            options={graphOptions}
                            selectedAuthorId={selectedAuthorId}
                            hoveredAuthorId={hoveredAuthorId}
                            minCoauthoredPublicationsCount={minCoauthoredPublicationsCount}
                            maxCoauthoredPublicationsCount={maxCoauthoredPublicationsCount}
                            onAuthorClick={setSelectedAuthorId}
                            onHoverChange={onCoauthorHoverChange}
                            nodes={nodes}
                            links={links}
                            ignoredLinksNodeIds={graphOptions.originalLinksDisplayed ? [] : allAuthors.ids} />
                    </DataVisualisationContainer> :
                    <span>Loading graph...</span>
            }
            <DataVisualisationContainer
                className='sm:row-start-2 sm:row-end-3 sm:col-start-1 sm:col-end-2 px-2 py-3 flex'>
                <GraphOptionsSelection
                    nodesCount={nodes.length}
                    linksCount={links.length}
                    options={graphOptions}
                    setOptions={setGraphOptions} />
            </DataVisualisationContainer>
            <DataVisualisationContainer
                className='h-full overflow-hidden sm:row-start-1 sm:row-end-3 sm:col-start-2 sm:col-end-3'>
                {
                    selectedAuthor ?
                        <SelectedAuthor
                            selectedAuthor={selectedAuthor}
                            authorsMap={authorsMap}
                            allAuthorIds={allAuthors.ids}
                            addAuthor={addAuthor}
                            removeAuthor={removeAuthor}
                            onCoauthorClick={setSelectedAuthorId}
                            onBackClick={onBackClick}
                            ignoredAuthorIds={authors.map((a) => a.id)}
                            onCoauthorHoverChange={onCoauthorHoverChange} /> :
                        <AuthorsList
                            nodes={nodesList}
                            onAuthorClick={setSelectedAuthorId}
                            title={`All Coauthors`}
                            onAuthorHoverChange={onCoauthorHoverChange} />
                }
            </DataVisualisationContainer>
        </div>
    )
}