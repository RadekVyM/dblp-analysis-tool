import { cn } from '@/shared/utils/tailwindUtils'
import { HiArrowNarrowRight } from 'react-icons/hi'

type LinkArrowParams = {
    className?: string
}

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