import { MdAutorenew } from 'react-icons/md'

export default function Loading() {
    return (
        <main className='grid h-full'>
            <MdAutorenew
                className='place-self-center w-10 h-10 animate-spin text-on-surface-muted' />
        </main>
    )
}