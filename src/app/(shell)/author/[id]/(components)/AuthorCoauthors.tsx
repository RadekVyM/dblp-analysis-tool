'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import Link from 'next/link'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import CoauthorsGraph from '@/components/data-visualisation/CoauthorsGraph'
import DataVisualisationContainer from '@/components/data-visualisation/DataVisualisationContainer'
import { convertToCoauthorsGraph } from '@/services/graphs/authors'
import { useMemo, useRef, useState } from 'react'
import ListButton from '@/components/ListButton'
import { cn } from '@/utils/tailwindUtils'
import LinkArrow from '@/components/LinkArrow'
import { HiArrowNarrowLeft } from 'react-icons/hi'
import { Section, SectionTitle } from './Section'

type AuthorCoauthorsParams = {
    author: DblpAuthor,
    className?: string
}

type CoauthorsListParams = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    onCoauthorClick: (id: string | null) => void,
    title: React.ReactNode
}

type SelectedAuthorParams = {
    ignoredAuthorIds?: Array<string>,
    selectedAuthor: PublicationPersonNodeDatum,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    onCoauthorClick: (id: string | null) => void,
    onBackClick: () => void
}

export default function AuthorCoauthors({ author }: AuthorCoauthorsParams) {
    const { nodes, links, authorsMap, minCoauthorsCount, maxCoauthorsCount } = useMemo(() =>
        convertToCoauthorsGraph(author.publications, [], [author.id]),
        [author]);
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
        if (id === author.id || selectedAuthorId === id) {
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

    return (
        <Section>
            <SectionTitle
                className='text-xl'>
                Coauthors
            </SectionTitle>

            <div
                className={cn('grid grid-rows-[1fr_auto] grid-cols-[1fr_18rem] gap-3 h-[100vh] min-h-[30rem] max-h-[min(80vh,40rem)]')}>
                {
                    (nodes && nodes.length > 0) ?
                        <DataVisualisationContainer
                            className='overflow-hidden w-full h-full'>
                            <CoauthorsGraph
                                className='w-full h-full'
                                selectedAuthorId={selectedAuthorId}
                                onAuthorClick={setSelectedAuthorId}
                                nodes={nodes}
                                links={links}
                                ignoredLinksNodeIds={[]} />
                        </DataVisualisationContainer> :
                        <span>Loading graph...</span>
                }
                <DataVisualisationContainer
                    className='h-full overflow-hidden row-start-1 row-end-3 col-start-2 col-end-3'>
                    {
                        selectedAuthor ?
                            <SelectedAuthor
                                selectedAuthor={selectedAuthor}
                                authorsMap={authorsMap}
                                onCoauthorClick={setSelectedAuthorId}
                                onBackClick={onBackClick}
                                ignoredAuthorIds={[author.id]} /> :
                            <CoauthorsList
                                nodes={nodes.filter((a) => a.person.id !== author.id)}
                                links={links}
                                onCoauthorClick={setSelectedAuthorId}
                                title={`Coauthors of ${author.name}`} />
                    }
                </DataVisualisationContainer>
                <DataVisualisationContainer
                    className='row-start-2 row-end-3 col-start-1 col-end-2 px-4 py-3'>
                    <span>Options</span>
                </DataVisualisationContainer>
            </div>
        </Section>
    )
}

function SelectedAuthor({ selectedAuthor, authorsMap, ignoredAuthorIds, onBackClick, onCoauthorClick }: SelectedAuthorParams) {
    const coauthors = useMemo(() =>
        [...selectedAuthor.coauthorIds.values()]
            .map((id) => authorsMap.get(id))
            .filter((a) => a && !ignoredAuthorIds?.includes(a.person.id)),
        [selectedAuthor])

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
            <div
                className='flex-1 h-full mt-3 py-2 overflow-auto thin-scrollbar'>
                {
                    coauthors.length > 0 &&
                    <>
                        <h5 className='font-bold mx-4 text-sm'>Common Coauthors</h5>
                        <ul
                            className='px-3 py-2 flex flex-col gap-1'>
                            {coauthors.map((a) =>
                                <li
                                    key={a?.person.id}>
                                    <ListButton
                                        size='sm'
                                        onClick={() => onCoauthorClick(a?.person.id || null)}
                                        className='w-full'>
                                        {a?.person.name}
                                    </ListButton>
                                </li>)}
                        </ul>
                    </>
                }
            </div>
        </article>
    )
}

function CoauthorsList({ nodes, links, title, onCoauthorClick }: CoauthorsListParams) {
    return (
        <article
            className='flex flex-col h-full w-full'>
            <h4 className='mx-4 mt-5 mb-4 font-bold'>{title}</h4>
            <ul
                className='flex-1 h-full px-3 py-2 flex flex-col gap-1 overflow-auto thin-scrollbar'>
                {nodes.map((coauthor) =>
                    <li
                        key={coauthor.person.id}>
                        <ListButton
                            size='sm'
                            onClick={() => onCoauthorClick(coauthor.person.id)}
                            className='w-full'>
                            {coauthor.person.name}
                        </ListButton>
                    </li>)}
            </ul>
            <footer
                className='mx-5 mb-5'>
                <span className='block mb-3'>Coauthors count: {nodes.length}</span>
                <span className='block'>Edges count: {links.length}</span>
            </footer>
        </article>
    )
}