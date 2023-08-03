import { MdSearch } from 'react-icons/md'

export interface SearchBarButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

export default function SearchBarButton({ ...props }: SearchBarButton) {
    return (
        <button
            className='place-content-center relative min-w-[15rem] w-full h-9 bg-gray-50 hover:bg-gray-100 text-sm border border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700 rounded-lg cursor-text'
            {...props}>
            <span className='block px-3 pl-9 text-gray-500 w-full text-start'>Search dblp...</span>
            <div
                className='absolute top-0 grid place-items-center w-9 h-full pointer-events-none'>
                <MdSearch
                    className='w-4 h-4' />
            </div>
        </button>
    )
}