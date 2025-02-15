'use client'

import { MdSearch } from 'react-icons/md'
import Button from '../inputs/Button'
import { cn } from '@/utils/tailwindUtils'
import { useSearchParams } from 'next/navigation'
import { isNullOrWhiteSpace } from '@/utils/strings'

export interface SearchBarButtonParams extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
}

type TextContentParams = {
    children: React.ReactNode,
    className?: string
}

/** Button that looks like a search bar and that opens the search dialog on click. */
export default function SearchBarButton({ className, ...props }: SearchBarButtonParams) {
    const searchParams = useSearchParams();
    const query = searchParams.get('query');

    return (
        <Button
            variant='outline'
            className={cn('justify-start cursor-text', className)}
            {...props}>
            <div
                className='grid place-items-center w-4 h-full pointer-events-none'>
                <MdSearch
                    className='w-4 h-4' />
            </div>
            {
                isNullOrWhiteSpace(query) ?
                    <TextContent className='text-on-surface-container-muted'>Search dblp...</TextContent> :
                    <TextContent>{query}</TextContent>
            }
        </Button>
    )
}

function TextContent({ children, className }: TextContentParams) {
    return (
        <span className={cn('block pl-2 w-full text-start select-none overflow-hidden whitespace-nowrap', className)}>{children}</span>
    )
}