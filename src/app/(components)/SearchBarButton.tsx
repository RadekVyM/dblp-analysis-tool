'use client'

import { MdSearch } from 'react-icons/md'

export interface SearchBarButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

export default function SearchBarButton({ ...props }: SearchBarButton) {
    return (
        <button
            className='px-3 place-content-center relative min-w-[15rem] w-full h-9 bg-gray-50 hover:bg-gray-100 text-sm border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700 rounded-lg cursor-text'
            {...props}>
            <span className='block pl-6 text-gray-500 w-full text-start'>Search dblp...</span>
            <div
                className='absolute top-0 flex place-items-center h-full pointer-events-none'>
                <MdSearch />
            </div>
        </button>
    )
}