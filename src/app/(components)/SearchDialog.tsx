'use client'

import { forwardRef, useState, useEffect, FormEvent } from 'react'
import Button from './Button'
import { useAuthorsSearch, useVenuesSearch } from '@/client/fetching'
import { useDebounce } from 'usehooks-ts'
import { useSearchParams } from 'next/navigation'
import { MdSearch } from 'react-icons/md'
import { DblpCompletion } from '@/dtos/DblpSearchResult'
import Link from 'next/link'
import { createSearchUrl } from '@/utils/urls'

const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_UP_KEY = 'ArrowUp';
const ENTER_KEY = 'Enter';

type SearchDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

type ResultsListParams = {
    query: string,
    selectedUrl: string | undefined,
    hide: () => void,
    setUrls: (url: Array<string>) => void
}

export const SearchDialog = forwardRef<HTMLDialogElement, SearchDialogParams>(({ hide: hide, animation, isOpen }, ref) => {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [urls, setUrls] = useState<Array<string>>([]);
    const [selectedUrl, setSelectedUrl] = useState<string | undefined>(undefined);
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);

    useEffect(() => {
        setSearchQuery(isOpen ? searchParams.get('q') || '' : '');
    }, [isOpen]);

    function onKeyDown(key: string) {
        switch (key) {
            case ARROW_DOWN_KEY:
                break;
            case ARROW_UP_KEY:
                break;
            case ENTER_KEY:
                break;
        }
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
    }

    return (
        <dialog
            id='search-view-dialog'
            ref={ref}
            open={false}
            className={`z-20 md:max-w-3xl w-full min-h-[25rem] bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg backdrop:backdrop-blur-md ${animation}`}
            onClick={() => hide()}
            onCancel={(event) => {
                event.preventDefault();
                hide();
            }}>
            <div
                className='absolute inset-0 flex flex-col h-full' onClick={(event) => event.stopPropagation()}>
                <div
                    className='px-6 pt-6 pb-2 justify-self-stretch bg-gray-50'>
                    <form
                        className='relative'
                        onSubmit={onSubmit}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onKeyDown={(event) => onKeyDown(event.key)}
                            placeholder='Search dblp...'
                            className='w-full h-11 px-3 pl-10 bg-gray-50 hover:bg-gray-100 text-lg border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700 rounded-lg' />
                        <div
                            className='absolute top-0 grid place-items-center w-10 h-full pointer-events-none'>
                            <MdSearch
                                className='w-5 h-5' />
                        </div>
                    </form>
                </div>

                <div
                    className='flex-1 overflow-y-auto px-6 pb-6'>
                    {isOpen &&
                        <ResultsList
                            query={debouncedSearchQuery}
                            selectedUrl={selectedUrl}
                            hide={hide}
                            setUrls={setUrls} />}
                </div>

                {
                    /*
                    <div>
                    <Button
                        variant='default' onClick={() => hide()}>Close</Button>
                </div>
                    */
                }
            </div>
        </dialog>
    );
});

function ResultsList({ query, setUrls, hide }: ResultsListParams) {
    const authorsResult = useAuthorsSearch(query);
    const venuesResult = useVenuesSearch(query);

    const completions = mergeCompletions(
        authorsResult.authors?.completions.items || [],
        venuesResult.venues?.completions.items || []);

    useEffect(() => {
        const urls = completions
            .map(c => c.localUrl)
            .concat(...(authorsResult.authors?.hits.items.map(i => i.info.localUrl) || []), ...(venuesResult.venues?.hits.items.map(i => i.info.localUrl) || []));

        setUrls(urls);
    }, [authorsResult.authors, venuesResult.venues]);

    return (
        <>
            <ul>
                {
                    completions.length > 0 &&
                    <li
                        className='p-2'>
                        <h3 className='hidden'>Suggestions</h3>
                        <ul>
                            {
                                completions.map(completion => (
                                    <li key={completion.id}>
                                        <Link
                                            className='block px-3 py-2 my-1 rounded-md hover:bg-gray-100'
                                            href={completion.localUrl}
                                            onClick={() => hide()}>
                                            {completion.text}
                                        </Link>
                                    </li>))
                            }
                        </ul>
                    </li>
                }
                {
                    !authorsResult.isLoading && !authorsResult.isError && (authorsResult.authors?.hits.items.length || 0) > 0 &&
                    <li
                        className='border-t border-gray-200 dark:border-gray-800 p-2'>
                        <h3 className='font-semibold'>Authors</h3>
                        <ul>
                            {authorsResult.authors?.hits.items.map(item => (
                                <li key={item.id}>
                                    <Link
                                        className='block px-3 py-2 my-1 rounded-md hover:bg-gray-100'
                                        href={item.info.localUrl}
                                        onClick={() => hide()}>
                                        {item.info.author}
                                    </Link>
                                </li>))}
                        </ul>
                    </li>
                }
                {
                    !venuesResult.isLoading && !venuesResult.isError && (venuesResult.venues?.hits.items.length || 0) > 0 &&
                    <li
                        className='border-t border-gray-200 dark:border-gray-800 p-2'>
                        <h3 className='font-semibold'>Venues</h3>
                        <ul>
                            {venuesResult.venues?.hits.items.map(item => (
                                <li key={item.id}>
                                    <Link
                                        className='block px-3 py-2 my-1 rounded-md hover:bg-gray-100'
                                        href={item.info.localUrl}
                                        onClick={() => hide()}>
                                        {item.info.venue}
                                    </Link>
                                </li>))}
                        </ul>
                    </li>
                }
            </ul>
        </>
    )
}

function mergeCompletions(auhorsCompletions: Array<DblpCompletion>, venuesCompletions: Array<DblpCompletion>) {
    const completions: Array<DblpCompletion> = [];
    const maxLength = 5;

    for (let i = 0; i < Math.max(auhorsCompletions.length, venuesCompletions.length); i++) {
        if (i < auhorsCompletions.length)
            completions.push(auhorsCompletions[i]);

        if (completions.length == maxLength)
            break;

        if (i < venuesCompletions.length)
            completions.push(venuesCompletions[i]);

        if (completions.length == maxLength)
            break;
    }

    return completions;
}