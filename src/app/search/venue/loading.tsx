import { MdAutorenew } from 'react-icons/md'

export default function Loading() {
    return (
        <div className='flex-1 grid h-full w-full'>
            <MdAutorenew
                className='place-self-center w-10 h-10 animate-spin text-on-surface-muted' />
        </div>
    )
}