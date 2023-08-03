'use client'

import { forwardRef, useState, useEffect } from 'react'
import Button from './Button'
import { useAuthorsSearch, useVenuesSearch } from '@/client/fetching'
import { useDebounce } from 'usehooks-ts'
import { useSearchParams } from 'next/navigation'
import { MdSearch } from 'react-icons/md'

type SearchDialogParams = {
    onHide: () => void,
    animation: string,
    isOpen: boolean,
}

type ResultsListParams = {
    query: string
}

export const SearchDialog = forwardRef<HTMLDialogElement, SearchDialogParams>(({ onHide, animation, isOpen }, ref) => {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);

    useEffect(() => {
        setSearchQuery(isOpen ? searchParams.get('q') || '' : '');
    }, [isOpen]);

    return (
        <dialog
            id='search-view-dialog'
            ref={ref}
            open={false}
            className={`z-20 md:max-w-3xl w-full min-h-[25rem] bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg backdrop:backdrop-blur-md ${animation}`}
            onClick={() => onHide()}
            onCancel={(event) => {
                event.preventDefault();
                onHide();
            }}>
            <div
                className='flex flex-col place-self-stretch p-6' onClick={(event) => event.stopPropagation()}>
                <div
                    className='relative justify-self-stretch'>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder='Search dblp...'
                        className='w-full h-11 px-3 pl-10 bg-gray-50 hover:bg-gray-100 text-lg border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700 rounded-lg' />
                    <div
                        className='absolute top-0 grid place-items-center w-10 h-full pointer-events-none'>
                        <MdSearch
                            className='w-5 h-5' />
                    </div>
                </div>

                <div
                    className='flex-1'>
                    {isOpen &&
                        <ResultsList
                            query={debouncedSearchQuery} />}
                </div>

                <Button
                    className='' onClick={() => onHide()}>Close</Button>
            </div>
        </dialog>
    );
});

function ResultsList({ query }: ResultsListParams) {
    const authorsResult = useAuthorsSearch(query);
    const venuesResult = useVenuesSearch(query);

    return (
        <>
            {
                authorsResult.isLoading ? <span>Loading...</span> :
                    authorsResult.isError ? <span>Error</span> :
                        <ul>
                            {authorsResult.authors?.hits.items.map(item => (<li key={item.id}>{item.info.author}</li>))}
                        </ul>
            }
            {
                venuesResult.isLoading ? <span>Loading...</span> :
                    venuesResult.isError ? <span>Error</span> :
                        <ul>
                            {venuesResult.venues?.hits.items.map(item => (<li key={item.id}>{item.info.venue}</li>))}
                        </ul>
            }
        </>
    )
}