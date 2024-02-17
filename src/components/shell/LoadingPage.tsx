import { cn } from '@/utils/tailwindUtils'
import LoadingWheel from '../LoadingWheel'

type LoadingPageParams = {
    className?: string
}

/** Content that is displayed when a page is loading. */
export default function LoadingPage({ className }: LoadingPageParams) {
    return (
        <main
            className={cn('grid h-full w-full', className)}>
            <LoadingWheel
                className='place-self-center w-10 h-10 text-gray-500' />
        </main>
    )
}