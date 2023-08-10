'use client'

import { forwardRef, useState, useEffect, useRef, FormEvent, KeyboardEvent, FocusEvent } from 'react'
import { useAuthorsSearch, useVenuesSearch } from '@/client/fetching/searchFetching'
import { useDebounce } from 'usehooks-ts'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { MdSearch, MdClose, MdAutorenew } from 'react-icons/md'
import { DblpCompletion } from '@/shared/dtos/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import Link from 'next/link'
import { createSearchPath } from '@/shared/utils/urls'
import Button from './Button'

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
    onSubmit: (event: FormEvent<HTMLFormElement>) => void,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void,
    onBlur: (event: FocusEvent<HTMLInputElement, Element>) => void
}

type SearchTypeSelectionParams = {
    selectedSearchType: SearchType,
    setSelectedSearchType: (searchType: SearchType) => void
}

type SearchTypeSelectionButtonParams = {
    title: string,
    searchType: SearchType,
    selectedSearchType: SearchType,
    onChange: (searchType: SearchType) => void
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

export const SearchDialog = forwardRef<HTMLDialogElement, SearchDialogParams>(({ hide, animation, isOpen }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [urls, setUrls] = useState<Array<string>>([]);
    const [selectedSearchType, setSelectedSearchType] = useState<SearchType>(SearchType.Author);
    const [selectedUrl, setSelectedUrl] = useState<string | undefined>(undefined);
    const debouncedSearchQuery = useDebounce(searchQuery, 750);

    useEffect(() => {
        setSearchQuery(isOpen ? searchParams.get('q') || '' : '');
        if (isOpen) {
            setSelectedSearchType(pathname.startsWith('/search/venue') ? SearchType.Venue : SearchType.Author);
            inputRef.current?.focus();
        }
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
        const url = selectedUrl || createSearchPath(searchQuery, selectedSearchType);

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
            This allows to align the main dialog content (the inner <article> element) to the top edge of the page
            */ }
            <article
                className='dialog flex flex-col h-auto min-h-[20rem] isolate' onClick={(event) => event.stopPropagation()}>
                <h2 className='sr-only'>Search dblp</h2>
                <header
                    className='z-10 top-0 flex flex-col gap-4 px-6 pt-6 pb-2 bg-inherit'>
                    <div
                        className='flex gap-2 justify-between'>
                        <SearchTypeSelection
                            selectedSearchType={selectedSearchType}
                            setSelectedSearchType={setSelectedSearchType} />

                        <Button
                            title='Close'
                            size='sm' variant='icon-outline'
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
                        onBlur={() => setSelectedUrl(undefined)} />
                </header>

                <div
                    className='grid flex-1 overflow-y-auto scroll-smooth px-6 pb-3'>
                    {isOpen &&
                        <ResultsList
                            query={debouncedSearchQuery}
                            selectedUrl={selectedUrl}
                            selectedSearchType={selectedSearchType}
                            hide={hide}
                            setUrls={setUrls} />}
                </div>
            </article>
        </dialog>
    );
});

export const SearchInput = forwardRef<HTMLInputElement, SearchInputParams>(({ searchQuery, onSearchQueryChange, onSubmit, onKeyDown, onBlur }, ref) => {
    return (
        <form
            className='relative'
            onSubmit={onSubmit}>
            <input
                autoFocus
                type="text"
                ref={ref}
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                placeholder='Search dblp...'
                className='w-full h-11 px-3 pl-10 bg-white hover:bg-gray-100 text-lg border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 rounded-lg transition-colors' />
            <div
                className='absolute top-0 grid place-items-center w-10 h-full pointer-events-none'>
                <MdSearch
                    className='w-5 h-5' />
            </div>
        </form>
    )
});

function SearchTypeSelection({ selectedSearchType, setSelectedSearchType }: SearchTypeSelectionParams) {
    return (
        <fieldset
            className='flex gap-2 has-focus-visible-outline rounded-sm'>
            <legend className='sr-only'>Select the search area:</legend>

            <SearchTypeSelectionInput
                title='Authors'
                searchType={SearchType.Author}
                selectedSearchType={selectedSearchType}
                onChange={setSelectedSearchType} />

            <SearchTypeSelectionInput
                title='Venues'
                searchType={SearchType.Venue}
                selectedSearchType={selectedSearchType}
                onChange={setSelectedSearchType} />
        </fieldset>
    )
}

function SearchTypeSelectionInput({ title, searchType, selectedSearchType, onChange }: SearchTypeSelectionButtonParams) {
    const id = `${SearchType[searchType]}-search-selection-radio`;
    const isSelected = selectedSearchType == searchType;

    return (
        <div
            className={`btn ${isSelected ? 'btn-default' : 'btn-outline'} place-content-stretch cursor-pointer select-none focus-within:outline focus-within:outline-2`}>
            <input
                className='sr-only'
                type="radio" id={id}
                onChange={(event) => onChange(SearchType[event.currentTarget.value as keyof typeof SearchType])}
                value={SearchType[searchType]} checked={isSelected} />
            <label
                className='cursor-pointer grid place-content-center px-3' htmlFor={id}><span>{title}</span></label>
        </div>
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
                            !authorsResult.isLoading && !authorsResult.isError && anyItems(...(authorsResult.authors?.hits.items || [])) &&
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
                            !venuesResult.isLoading && !venuesResult.isError && anyItems(...(venuesResult.venues?.hits.items || [])) &&
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
            tabIndex={-1}
            className={
                `relative flex px-3 py-2 my-1 rounded-md hover:bg-gray-100 hover:dark:bg-gray-800 transition-colors
                ${url == selectedUrl ? selectedStyling : ''}`
            }
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