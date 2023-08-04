import { MdSearch } from 'react-icons/md'
import Button from './Button'

export interface SearchBarButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

export default function SearchBarButton({ ...props }: SearchBarButton) {
    return (
        <Button
            variant='outline' size='sm'
            className='min-w-[15rem] w-full justify-start'
            {...props}>
            <div
                className='grid place-items-center w-6 h-full pointer-events-none'>
                <MdSearch
                    className='w-4 h-4' />
            </div>
            <span className='block px-2 text-gray-500 w-full text-start'>Search dblp...</span>
        </Button>
    )
}