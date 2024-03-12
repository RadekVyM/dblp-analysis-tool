'use client'

import { useEffect, useState } from 'react'
import { MdCancel, MdSearch } from 'react-icons/md'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { cn } from '@/utils/tailwindUtils'
import { useDebounce } from 'usehooks-ts'

type SearchBoxParams = {
    className?: string,
    placeholder?: string,
    searchQuery: string,
    onSearchQueryChange: (query: string) => void
}

export default function SearchBox({ className, searchQuery, placeholder, onSearchQueryChange }: SearchBoxParams) {
    const [localSearchQuery, setSearchQuery] = useState(searchQuery);
    const debouncedSearchQuery = useDebounce(localSearchQuery, 750);

    useEffect(() => {
        setSearchQuery(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        onSearchQueryChange(debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    return (
        <div
            className={cn('relative rounded-lg border border-outline bg-surface-container hover:bg-surface-dim-container transition-colors', className)}>
            <input
                type='text'
                value={localSearchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={placeholder || 'Search...'}
                className='w-full h-8 px-8 bg-transparent text-sm rounded-lg' />
            <div
                className='absolute top-0 grid place-items-center w-8 h-full pointer-events-none rounded-lg'>
                <MdSearch
                    className='w-4 h-4' />
            </div>
            {
                !isNullOrWhiteSpace(localSearchQuery) &&
                <button
                    type='button'
                    className='absolute top-0 right-0 grid place-items-center w-8 h-full rounded-lg'
                    onClick={() => setSearchQuery('')}>
                    <MdCancel />
                </button>
            }
        </div>
    )
}