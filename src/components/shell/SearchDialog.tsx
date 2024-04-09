'use client'

import { forwardRef, useState, useEffect, useRef, FormEvent, KeyboardEvent, FocusEvent, useCallback, useMemo } from 'react'
import { useDebounce } from 'usehooks-ts'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MdSearch, MdClose, MdCancel } from 'react-icons/md'
import { SearchCompletion } from '@/dtos/search/SearchResult'
import { SearchType } from '@/enums/SearchType'
import { createLocalSearchPath } from '@/utils/urls'
import Button from '../inputs/Button'
import { cn } from '@/utils/tailwindUtils'
import { isNullOrWhiteSpace } from '@/utils/strings'
import Tabs from '../Tabs'
import ListLink from '../ListLink'
import { Dialog, DialogContent } from '../dialogs/Dialog'
import { useAuthorsSearch } from '@/hooks/search/useAuthorsSearch'
import { useVenuesSearch } from '@/hooks/search/useVenuesSearch'
import LoadingWheel from '../LoadingWheel'
import he from 'he'
import { anyItems } from '@/utils/array'

const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_UP_KEY = 'ArrowUp';
const MAX_HITS_COUNT = 3;
const MAX_DISPLAYED_COMPLETIONS_COUNT = 4;

type SearchDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean
}

type SearchInputParams = {
    searchQuery: string,
    onSearchQueryChange: (value: string) => void,
    onClear: () => void,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void,
    onBlur: (event: FocusEvent<HTMLInputElement, Element>) => void
}

type SearchTypeSelectionParams = {
    selectedSearchType: SearchType,
    setSelectedSearchType: (searchType: SearchType) => void
}

type ResultsListParams = {
    query: string,
    selectedSearchType: SearchType,
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

/** Dialog for searching dblp. */
export const SearchDialog = forwardRef<HTMLDialogElement, SearchDialogParams>(({ hide, animation, isOpen }, ref) => {
    const pathname = usePathname();
    const [selectedSearchType, setSelectedSearchType] = useState<SearchType>(SearchType.Author);
    const {
        inputRef,
        searchQuery,
        debouncedSearchQuery,
        selectedUrl,
        setUrls,
        setSearchQuery,
        onKeyDown,
        onSubmit,
        onBlur,
        onClear
    } = useSearchInputState(selectedSearchType, isOpen, hide);

    useEffect(() => {
        if (isOpen) {
            setSelectedSearchType(pathname.startsWith('/search/venue') ? SearchType.Venue : SearchType.Author);
        }
    }, [isOpen, pathname]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [selectedSearchType, inputRef]);

    return (
        <Dialog
            id='search-view-dialog'
            ref={ref}
            className={cn(
                `flex-dialog md:max-w-3xl w-full h-full max-h-[90%]
                bg-transparent rounded-lg backdrop:backdrop-blur-md
                focus:outline-none`)}
            hide={hide}
            animation={animation}>
            { /*
            The <dialog> element is just an invisible contaier stretched accross the entire height of the page
            This allows to align the main dialog content (<DialogContent>) to the top edge of the page
            TODO: There must be a better way to do that
            */ }
            <DialogContent
                className='dialog flex flex-col h-auto min-h-[min(15rem)] max-h-full isolate'>
                <header
                    className='z-10 top-0 flex flex-col gap-4 px-6 pt-6 pb-2 bg-inherit'>
                    <h2 className='sr-only'>Search dblp</h2>
                    <div
                        className='flex gap-2 justify-between'>
                        <SearchTypeSelection
                            selectedSearchType={selectedSearchType}
                            setSelectedSearchType={setSelectedSearchType} />

                        <Button
                            title='Close'
                            variant='icon-outline'
                            onClick={() => hide()}>
                            <MdClose
                                className='w-5 h-5' />
                        </Button>
                    </div>

                    <SearchInput
                        ref={inputRef}
                        searchQuery={searchQuery}
                        onSearchQueryChange={(value) => setSearchQuery(value)}
                        onSubmit={onSubmit}
                        onKeyDown={onKeyDown}
                        onBlur={onBlur}
                        onClear={onClear} />
                </header>

                <div
                    className='grid flex-1 overflow-y-auto scroll-smooth thin-scrollbar px-6 pb-3'>
                    {isOpen &&
                        <ResultsList
                            query={debouncedSearchQuery}
                            selectedUrl={selectedUrl}
                            selectedSearchType={selectedSearchType}
                            hide={hide}
                            setUrls={setUrls} />}
                </div>
            </DialogContent>
        </Dialog>
    );
});

SearchDialog.displayName = 'SearchDialog';

const SearchInput = forwardRef<HTMLInputElement, SearchInputParams>(({ searchQuery, onSearchQueryChange, onSubmit, onKeyDown, onBlur, onClear }, ref) => {
    return (
        <form
            className='relative rounded-lg border border-outline bg-surface-container hover:bg-surface-dim-container transition-colors'
            onSubmit={onSubmit}>
            <input
                autoFocus
                type='text'
                ref={ref}
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                placeholder='Search dblp...'
                className='w-full h-11 px-10 bg-transparent text-lg rounded-lg' />
            <div
                className='absolute top-0 grid place-items-center w-10 h-full pointer-events-none rounded-lg'>
                <MdSearch
                    className='w-5 h-5' />
            </div>
            {
                !isNullOrWhiteSpace(searchQuery) &&
                <button
                    type='button'
                    className='absolute top-0 right-0 grid place-items-center w-10 h-full rounded-lg'
                    onClick={() => onClear()}>
                    <MdCancel />
                </button>
            }
        </form>
    )
});

SearchInput.displayName = 'SearchInput';

function SearchTypeSelection({ selectedSearchType, setSelectedSearchType }: SearchTypeSelectionParams) {
    const tabs = [{ content: 'Authors', id: SearchType.Author }, { content: 'Venues', id: SearchType.Venue }];

    return (
        <Tabs
            tabsId='search-dialog'
            items={tabs}
            legend='Select the search area:'
            selectedId={selectedSearchType}
            setSelectedId={(id) => setSelectedSearchType(id as SearchType)} />
    )
}

function ResultsList({ query, selectedUrl, selectedSearchType, setUrls, hide }: ResultsListParams) {
    const authorsResult = useAuthorsSearch(
        query,
        selectedSearchType == SearchType.Author ? MAX_HITS_COUNT : 0,
        selectedSearchType == SearchType.Author ? MAX_DISPLAYED_COMPLETIONS_COUNT : 0);
    const venuesResult = useVenuesSearch(
        query,
        selectedSearchType == SearchType.Venue ? MAX_HITS_COUNT : 0,
        selectedSearchType == SearchType.Venue ? MAX_DISPLAYED_COMPLETIONS_COUNT : 0);

    const completions = useMemo(
        () => mergeCompletions(
            authorsResult.authors?.completions.items || [],
            venuesResult.venues?.completions.items || []),
        [authorsResult.authors, venuesResult.venues]);

    useEffect(() => {
        const urls = completions
            .map(c => c.localUrl)
            .concat(...(authorsResult.authors?.hits.items.map(i => i.info.localUrl) || []), ...(venuesResult.venues?.hits.items.map(i => i.info.localUrl) || []));

        setUrls(urls);
        // setUrls should not trigger this effect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorsResult.authors, venuesResult.venues, completions]);

    return (
        <>
            {
                (!authorsResult.isLoading && !venuesResult.isLoading && !authorsResult.error && !venuesResult.error &&
                    anyItems(...completions, ...(authorsResult.authors?.hits.items || []), ...(venuesResult.venues?.hits.items || []))) ?
                    <ul>
                        {
                            anyItems(completions) &&
                            <li
                                className='p-2'>
                                <h3 className='sr-only'>Suggestions</h3>
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
                            !authorsResult.isLoading && !authorsResult.error && anyItems(...(authorsResult.authors?.hits.items || [])) &&
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
                            !venuesResult.isLoading && !venuesResult.error && anyItems(...(venuesResult.venues?.hits.items || [])) &&
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
                        <LoadingWheel
                            className='place-self-center w-8 h-8 text-on-surface-container-muted' />
                        :
                        <span
                            className='place-self-center text-on-surface-container-muted'>
                            No results found
                        </span>
            }
        </>
    )
}

function HitsList({ title, children }: ResultsHitsListParams) {
    return (
        <li
            className='border-t border-outline-variant p-2 pt-4' >
            <h3 className='font-semibold mb-2'>{title}</h3>
            {children}
        </li>
    )
}

function ResultsListItem({ url, selectedUrl, text, onClick }: ResultsListItemParams) {
    const liRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (selectedUrl == url) {
            liRef.current?.scrollIntoView({ block: 'center' });
        }
    }, [selectedUrl, url, liRef]);

    return (<li ref={liRef}>
        <ListLink
            tabIndex={-1}
            surface='container'
            marker={url == selectedUrl ? 'visible' : 'none'}
            className='my-1'
            href={url}
            onClick={() => onClick(url)}>
            {he.decode(text)}
        </ListLink>
    </li>)
}

function useSearchInputState(selectedSearchType: SearchType, isDialogOpen: boolean, hideDialog: () => void) {
    const inputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [urls, setUrls] = useState<Array<string>>([]);
    const [selectedUrl, setSelectedUrl] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 750);

    useEffect(() => {
        setSearchQuery(isDialogOpen ? searchParams.get('query') || '' : '');
        if (isDialogOpen) {
            inputRef.current?.focus();
        }
    }, [isDialogOpen, searchParams]);

    useEffect(() => {
        setSelectedUrl(undefined);
    }, [urls]);

    const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key == ARROW_DOWN_KEY || event.key == ARROW_UP_KEY) {
            event.preventDefault();

            if (!urls)
                return;

            const index = selectedUrl ? urls.indexOf(selectedUrl) : event.key == ARROW_DOWN_KEY ? -1 : urls.length;
            const newIndex = (index + (event.key == ARROW_DOWN_KEY ? 1 : -1));

            setSelectedUrl(newIndex < 0 || newIndex >= urls.length ? undefined : urls[newIndex]);
        }
    }, [urls, selectedUrl]);

    const onSubmit = useCallback((event: FormEvent) => {
        event.preventDefault();
        const url = selectedUrl || createLocalSearchPath(selectedSearchType, { query: searchQuery });
        router.push(url);
        hideDialog();
    }, [hideDialog, router, selectedUrl, searchQuery, selectedSearchType]);

    const onBlur = useCallback(() => {
        setSelectedUrl(undefined);
    }, []);

    const onClear = useCallback(() => {
        setSearchQuery('');
        inputRef.current?.focus();
    }, []);

    return {
        inputRef,
        debouncedSearchQuery,
        searchQuery,
        selectedUrl,
        urls,
        setUrls,
        setSearchQuery,
        onKeyDown,
        onSubmit,
        onBlur,
        onClear
    };
}

function mergeCompletions(auhorsCompletions: Array<SearchCompletion>, venuesCompletions: Array<SearchCompletion>) {
    const completions: Array<SearchCompletion> = [];

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