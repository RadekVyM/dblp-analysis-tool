'use client'

import { forwardRef, useState, useEffect, FormEvent, KeyboardEvent, useRef } from 'react'
import { useAuthorsSearch, useVenuesSearch } from '@/client/fetching'
import { useDebounce } from 'usehooks-ts'
import { useRouter, useSearchParams } from 'next/navigation'
import { MdSearch, MdClose, MdAutorenew } from 'react-icons/md'
import { DblpCompletion } from '@/shared/dtos/DblpSearchResult'
import Link from 'next/link'
import { createSearchUrl } from '@/shared/utils/urls'
import Button from './Button'

const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_UP_KEY = 'ArrowUp';
const MAX_HITS_COUNT = 3;
const MAX_DISPLAYED_COMPLETIONS_COUNT = 4;

type SearchDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

type ResultsListParams = {
    query: string,
    selectedUrl: string | undefined,
    hide: () => void,
    setUrls: (urls: Array<string>) => void
}

type ResultsHitsListParams = {
    title: string,
    children: React.ReactNode
}

type ResultsListItemParams = {
    url: string,
    selectedUrl: string | undefined,
    text: string,
    onClick: (url: string) => void,
}

export const SearchDialog = forwardRef<HTMLDialogElement, SearchDialogParams>(({ hide: hide, animation, isOpen }, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [urls, setUrls] = useState<Array<string>>([]);
    const [selectedUrl, setSelectedUrl] = useState<string | undefined>(undefined);
    const debouncedSearchQuery = useDebounce(searchQuery, 750);

    useEffect(() => {
        setSearchQuery(isOpen ? searchParams.get('q') || '' : '');
    }, [isOpen]);

    useEffect(() => {
        setSelectedUrl(undefined);
    }, [urls]);

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key == ARROW_DOWN_KEY || event.key == ARROW_UP_KEY) {
            event.preventDefault();

            if (!urls)
                return;

            const index = selectedUrl ? urls.indexOf(selectedUrl) : event.key == ARROW_DOWN_KEY ? -1 : urls.length;
            const newIndex = (index + (event.key == ARROW_DOWN_KEY ? 1 : -1));

            setSelectedUrl(newIndex < 0 || newIndex >= urls.length ? undefined : urls[newIndex]);
        }
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        const url = selectedUrl || createSearchUrl(searchQuery);

        router.push(url);
        hide();
    }

    return (
        <dialog
            id='search-view-dialog'
            ref={ref}
            open={false}
            className={`search-dialog z-20 md:max-w-3xl w-full h-full overflow-y-hidden bg-transparent rounded-lg backdrop:backdrop-blur-md ${animation}`}
            onClick={() => hide()}
            onCancel={(event) => {
                event.preventDefault();
                hide();
            }}>
            { /*
            The <dialog> element is just an invisible contaier stretched accross the entire height of the page
            This allows to align the main dialog content (the inner <div> element) to the top edge of the page
            */ }
            <div
                className='dialog flex flex-col h-auto min-h-[20rem] isolate' onClick={(event) => event.stopPropagation()}>
                <div
                    className='flex gap-2 z-10 top-0 px-6 pt-6 pb-2 justify-self-stretch bg-gray-50 dark:bg-gray-900'>
                    <form
                        className='relative flex-1'
                        onSubmit={onSubmit}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onKeyDown={(event) => onKeyDown(event)}
                            onBlur={() => setSelectedUrl(undefined)}
                            placeholder='Search dblp...'
                            className='w-full h-11 px-3 pl-10 bg-gray-50 hover:bg-gray-100 text-lg border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 rounded-lg transition-colors' />
                        <div
                            className='absolute top-0 grid place-items-center w-10 h-full pointer-events-none'>
                            <MdSearch
                                className='w-5 h-5' />
                        </div>
                    </form>
                    <Button
                        title='Close'
                        size='lg' variant='outline'
                        className='px-3'
                        onClick={() => hide()}>
                        <MdClose
                            className='w-5 h-5' />
                    </Button>
                </div>

                <div
                    className='grid flex-1 overflow-y-auto scroll-smooth px-6 pb-3'>
                    {isOpen &&
                        <ResultsList
                            query={debouncedSearchQuery}
                            selectedUrl={selectedUrl}
                            hide={hide}
                            setUrls={setUrls} />}
                </div>
            </div>
        </dialog>
    );
});

function ResultsList({ query, selectedUrl, setUrls, hide }: ResultsListParams) {
    const authorsResult = useAuthorsSearch(query, MAX_HITS_COUNT);
    const venuesResult = useVenuesSearch(query, MAX_HITS_COUNT);

    const completions = mergeCompletions(
        authorsResult.authors?.completions.items || [],
        venuesResult.venues?.completions.items || []);

    useEffect(() => {
        const urls = completions
            .map(c => c.localUrl)
            .concat(...(authorsResult.authors?.hits.items.map(i => i.info.localUrl) || []), ...(venuesResult.venues?.hits.items.map(i => i.info.localUrl) || []));

        setUrls(urls);
    }, [authorsResult.authors, venuesResult.venues]);

    function anyItems(...items: Array<any>) {
        return items.length > 0;
    }

    return (
        <>
            {
                (!authorsResult.isLoading && !venuesResult.isLoading && !authorsResult.isError && !venuesResult.isError &&
                    anyItems(...completions, ...(authorsResult.authors?.hits.items || []), ...(venuesResult.venues?.hits.items || []))) ?
                    <ul>
                        {
                            anyItems(completions) &&
                            <li
                                className='p-2'>
                                <h3 className='hidden-a11y'>Suggestions</h3>
                                <ul>
                                    {
                                        completions.map(completion => (
                                            <ResultsListItem
                                                key={completion.id}
                                                text={completion.text}
                                                url={completion.localUrl}
                                                selectedUrl={selectedUrl}
                                                onClick={(url) => hide()} />
                                        ))
                                    }
                                </ul>
                            </li>
                        }
                        {
                            !authorsResult.isLoading && !authorsResult.isError && anyItems(authorsResult.authors?.hits.items) &&
                            <HitsList
                                title='Authors'>
                                <ul>
                                    {authorsResult.authors?.hits.items.map(item => (
                                        <ResultsListItem
                                            key={item.id}
                                            text={item.info.author}
                                            url={item.info.localUrl}
                                            selectedUrl={selectedUrl}
                                            onClick={(url) => hide()} />
                                    ))}
                                </ul>
                            </HitsList>
                        }
                        {
                            !venuesResult.isLoading && !venuesResult.isError && anyItems(venuesResult.venues?.hits.items) &&
                            <HitsList
                                title='Venues'>
                                <ul>
                                    {venuesResult.venues?.hits.items.map(item => (
                                        <ResultsListItem
                                            key={item.id}
                                            text={item.info.venue}
                                            url={item.info.localUrl}
                                            selectedUrl={selectedUrl}
                                            onClick={(url) => hide()} />
                                    ))}
                                </ul>
                            </HitsList>
                        }
                    </ul>
                    : (authorsResult.isLoading || venuesResult.isLoading) ?
                        <MdAutorenew
                            className='place-self-center w-10 h-10 animate-spin text-gray-500' />
                        :
                        <span
                            className='place-self-center text-gray-500'>
                            No results found
                        </span>
            }
            { /* Find better loading icon than MdAutorenew */}
        </>
    )
}

function HitsList({ title, children }: ResultsHitsListParams) {
    return (
        <li
            className='border-t border-gray-200 dark:border-gray-800 p-2 pt-4' >
            <h3 className='font-semibold mb-2'>{title}</h3>
            {children}
        </li>
    )
}

function ResultsListItem({ url, selectedUrl, text, onClick }: ResultsListItemParams) {
    const selectedStyling = 'bg-gray-100 dark:bg-gray-800 before:content-[""] before:block before:absolute before:left-0 before:top-1/2 before:translate-y-[-50%] before:bg-accent before:w-1 before:h-4 before:rounded-sm';
    const liRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (selectedUrl == url) {
            liRef.current?.scrollIntoView({ block: 'center' });
        }
    }, [selectedUrl]);

    return (<li ref={liRef}>
        <Link
            className={`relative flex px-3 py-2 my-1 rounded-md hover:bg-gray-100 hover:dark:bg-gray-800 transition-colors ${url == selectedUrl ? selectedStyling : ''}`}
            href={url}
            onClick={() => onClick(url)}
            dangerouslySetInnerHTML={{ __html: text }}>
        </Link>
    </li>)
}

function mergeCompletions(auhorsCompletions: Array<DblpCompletion>, venuesCompletions: Array<DblpCompletion>) {
    const completions: Array<DblpCompletion> = [];

    for (let i = 0; i < Math.max(auhorsCompletions.length, venuesCompletions.length); i++) {
        if (i < auhorsCompletions.length)
            completions.push(auhorsCompletions[i]);

        if (completions.length == MAX_DISPLAYED_COMPLETIONS_COUNT)
            break;

        if (i < venuesCompletions.length)
            completions.push(venuesCompletions[i]);

        if (completions.length == MAX_DISPLAYED_COMPLETIONS_COUNT)
            break;
    }

    return completions;
}