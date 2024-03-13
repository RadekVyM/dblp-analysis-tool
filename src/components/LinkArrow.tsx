import { cn } from '@/utils/tailwindUtils'
import { HiArrowNarrowRight } from 'react-icons/hi'

type LinkArrowParams = {
    className?: string
}

/** Arrow that should be displayd in headings that act as links. */
export default function LinkArrow({ className }: LinkArrowParams) {
    return (
        <>
            &nbsp;<span
                className='whitespace-nowrap'>
                &nbsp;
                <HiArrowNarrowRight
                    aria-hidden
                    className={cn('inline-block', className)} />
            </span>
        </>
    )
}