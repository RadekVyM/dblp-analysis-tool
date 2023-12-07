'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import Link from 'next/link'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import CoauthorsGraph, { GraphOptions } from '@/components/data-visualisation/CoauthorsGraph'
import DataVisualisationContainer from '@/components/data-visualisation/DataVisualisationContainer'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import ListButton from '@/components/ListButton'
import { cn } from '@/utils/tailwindUtils'
import LinkArrow from '@/components/LinkArrow'
import { HiArrowNarrowLeft } from 'react-icons/hi'
import { Section, SectionTitle } from './Section'
import { DblpPublicationPerson } from '@/dtos/DblpPublication'
import { useHover } from 'usehooks-ts'
import CheckListButton from '@/components/CheckListButton'
import { fetchAuthor } from '@/services/authors/fetch-server'
import LoadingWheel from '@/components/LoadingWheel'
import Table from '@/components/data-visualisation/Table'

type AuthorCoauthorsParams = {
    authors: Array<DblpAuthor>,
    className?: string
}

type AuthorsListParams = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    onAuthorClick: (id: string | null) => void,
    onAuthorHoverChange: (id: string, isHovered: boolean) => void,
    title: React.ReactNode
}

type SelectedAuthorParams = {
    onBackClick: () => void,
} & SelectedAuthorContentParams

type SelectedAuthorContentParams = {
    ignoredAuthorIds?: Array<string>,
    selectedAuthor: PublicationPersonNodeDatum,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    onCoauthorClick: (id: string | null) => void,
    onCoauthorHoverChange: (id: string, isHovered: boolean) => void
}

type AuthorListItemParams = {
    person: DblpPublicationPerson,
    onAuthorClick: (id: string | null) => void,
    onHoverChange: (id: string, isHovered: boolean) => void
}

type GraphOptionsSelectionParams = {
    options: GraphOptions,
    setOptions: (options: Partial<GraphOptions>) => void
}

type CoauthorsTableParams = {
    nodes: Array<PublicationPersonNodeDatum>
}

export default function AuthorCoauthors({ authors }: AuthorCoauthorsParams) {
    const {
        nodes,
        links,
        authorsMap,
        minCoauthorsCount,
        maxCoauthorsCount,
        minCoauthoredPublicationsCount,
        maxCoauthoredPublicationsCount
    } = useMemo(() =>
        convertToCoauthorsGraph(authors.flatMap((a) => a.publications), [], authors.map((a) => a.id)),
        [authors]);
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
        [selectedAuthorId]);

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

    return (
        <Section>
            <SectionTitle
                className='text-xl'>
                Coauthors
            </SectionTitle>

            <div
                className={cn(
                    'grid gap-3',
                    'grid-rows-[0.75fr_auto_1fr] grid-cols-[1fr] h-[100vh] max-h-[max(100vh,40rem)]',
                    'sm:grid-rows-[1fr_auto] sm:grid-cols-[1fr_minmax(auto,18rem)] sm:h-[100vh] sm:min-h-[30rem] sm:max-h-[min(80vh,40rem)]')}>
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
                                ignoredLinksNodeIds={graphOptions.originalLinksDisplayed ? [] : authors.map((a) => a.id)} />
                        </DataVisualisationContainer> :
                        <span>Loading graph...</span>
                }
                <DataVisualisationContainer
                    className='sm:row-start-2 sm:row-end-3 sm:col-start-1 sm:col-end-2 px-2 py-3'>
                    <GraphOptionsSelection
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
                                onCoauthorClick={setSelectedAuthorId}
                                onBackClick={onBackClick}
                                ignoredAuthorIds={authors.map((a) => a.id)}
                                onCoauthorHoverChange={onCoauthorHoverChange} /> :
                            <AuthorsList
                                nodes={nodes.filter((a) => !authors.some((aa) => aa.id === a.person.id))}
                                links={links}
                                onAuthorClick={setSelectedAuthorId}
                                title={`All Coauthors`}
                                onAuthorHoverChange={onCoauthorHoverChange} />
                    }
                </DataVisualisationContainer>
            </div>

            <DataVisualisationContainer
                className='mt-10 overflow-hidden'>
                <CoauthorsTable
                    nodes={nodes.filter((a) => !authors.some((aa) => aa.id === a.person.id))} />
            </DataVisualisationContainer>
        </Section>
    )
}

function GraphOptionsSelection({ options, setOptions }: GraphOptionsSelectionParams) {
    return (
        <>
            <CheckListButton
                className='w-auto'
                isSelected={options.originalLinksDisplayed}
                onClick={() => setOptions({ originalLinksDisplayed: !options.originalLinksDisplayed })}>
                Show OG links
            </CheckListButton>
        </>
    )
}

function SelectedAuthor({ selectedAuthor, authorsMap, ignoredAuthorIds, onBackClick, onCoauthorClick, onCoauthorHoverChange }: SelectedAuthorParams) {
    return (
        <article
            className='flex flex-col h-full w-full'>
            <button
                className='mx-4 mt-4 self-start flex gap-2 items-center text-on-surface-container hover:text-on-surface-container-muted'
                onClick={onBackClick}>
                <HiArrowNarrowLeft />
                Back
            </button>
            <Link
                prefetch={false}
                className='mx-4 mt-5 link-heading block w-fit text-on-surface-muted hover:text-on-surface transition-colors'
                href={createLocalPath(selectedAuthor.person.id, SearchType.Author)}>
                <h4
                    className='inline font-bold text-on-surface'>
                    {selectedAuthor.person.name}
                </h4>
                <LinkArrow
                    className='w-6 h-5 ml-[-0.1rem] mt-[-0.2rem]' />
            </Link>

            <SelectedAuthorContent
                selectedAuthor={selectedAuthor}
                authorsMap={authorsMap}
                ignoredAuthorIds={ignoredAuthorIds}
                onCoauthorClick={onCoauthorClick}
                onCoauthorHoverChange={onCoauthorHoverChange} />
        </article>
    )
}

function SelectedAuthorContent({ selectedAuthor, authorsMap, ignoredAuthorIds, onCoauthorClick, onCoauthorHoverChange }: SelectedAuthorContentParams) {
    const coauthors = useMemo(() =>
        [...selectedAuthor.coauthorIds.values()]
            .map((id) => authorsMap.get(id))
            .filter((a) => a && !ignoredAuthorIds?.includes(a.person.id)),
        [selectedAuthor])
    const [fetchedAuthor, setFetchedAuthor] = useState<DblpAuthor | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        fetchAuthor(selectedAuthor.person.id)
            .then((data) => {
                setFetchedAuthor(data);
            })
            .catch((e) => {
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, [selectedAuthor]);

    return isLoading ?
        <div
            className='flex-1 grid place-content-center'>
            <LoadingWheel
                className='text-on-surface-container-muted w-8 h-8' />
        </div> :
        <div
            className='flex-1 h-full pb-2 mt-2 overflow-auto thin-scrollbar'>
            {
                (fetchedAuthor?.info?.affiliations.length || 0) > 0 &&
                <ul
                    className='mx-4 mb-3 flex flex-col gap-1'>
                    {fetchedAuthor?.info?.affiliations.map((affiliation) =>
                        <li
                            key={affiliation}
                            className='text-xs text-on-surface-muted'>
                            {affiliation}
                        </li>)}
                </ul>
            }
            {
                coauthors.length > 0 &&
                <>
                    <h5 className='font-bold mx-4 mt-4 text-sm'>Common Coauthors</h5>
                    <ul
                        className='px-3 py-2 flex flex-col gap-1'>
                        {coauthors.map((a) =>
                            a &&
                            <AuthorListItem
                                key={a.person.id}
                                onAuthorClick={onCoauthorClick}
                                person={a.person}
                                onHoverChange={onCoauthorHoverChange} />)}
                    </ul>
                </>
            }
            {
                fetchedAuthor &&
                <>
                </>
            }
        </div>
}

function AuthorsList({ nodes, links, title, onAuthorClick, onAuthorHoverChange }: AuthorsListParams) {
    return (
        <article
            className='flex flex-col h-full w-full'>
            <h4 className='mx-4 mt-5 mb-4 font-bold'>{title}</h4>
            <ul
                className='flex-1 h-full px-3 py-2 flex flex-col gap-1 overflow-auto thin-scrollbar'>
                {nodes.map((coauthor) =>
                    <AuthorListItem
                        key={coauthor.person.id}
                        onAuthorClick={onAuthorClick}
                        person={coauthor.person}
                        onHoverChange={onAuthorHoverChange} />)}
            </ul>
            <footer
                className='mx-5 mb-5'>
                <span className='block mb-3'>Coauthors count: {nodes.length}</span>
                <span className='block'>Edges count: {links.length}</span>
            </footer>
        </article>
    )
}

function AuthorListItem({ person, onAuthorClick, onHoverChange }: AuthorListItemParams) {
    const listItemRef = useRef<HTMLLIElement>(null);
    const isHovered = useHover(listItemRef);

    useEffect(() => {
        onHoverChange(person.id, isHovered);
    }, [isHovered]);

    return (
        <li
            ref={listItemRef}>
            <ListButton
                size='sm'
                onClick={() => onAuthorClick(person.id)}
                className='w-full'>
                {person.name}
            </ListButton>
        </li>
    )
}

function CoauthorsTable({ nodes }: CoauthorsTableParams) {
    const rows = useMemo(() =>
        nodes.map((node, index) => {
            return [
                { value: node.person.name, presentedContent: node.person.name },
                { value: node.coauthorIds.size, presentedContent: node.coauthorIds.size },
                { value: node.count, presentedContent: node.count }
            ]
        }),
        [nodes]);

    return (
        <Table
            className='h-100 max-h-[max(60vh,20rem)]'
            rows={rows}
            columnHeaders={[
                {
                    column: 0,
                    sortingTitle: 'Sort by author name',
                    title: 'Couthor',
                    className: 'w-[20rem]'
                },
                {
                    column: 1,
                    sortingTitle: 'Sort by common coauthors count',
                    title: 'Common coauthors count'
                },
                {
                    column: 2,
                    sortingTitle: 'Sort by common publications count',
                    title: 'Common publications count'
                }
            ]} />
    )
}

function useGraphOptions() {
    return useReducer(
        (state: GraphOptions, newState: Partial<GraphOptions>) => ({
            ...state,
            ...newState,
        }),
        {
            originalLinksDisplayed: true
        }
    );
}