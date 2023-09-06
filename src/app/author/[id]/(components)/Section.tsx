import { cn } from '@/shared/utils/tailwindUtils'
import Link from 'next/link'
import { HiArrowNarrowRight } from 'react-icons/hi'

type SectionTitleParams = {
    className?: string,
    href?: string,
    children: React.ReactNode
}

type HeadingParams = {
    className?: string,
    children: React.ReactNode
}

export function Section({ children }: { children: React.ReactNode }) {
    return (
        <section className='mb-12'>{children}</section>
    )
}

export function SectionTitle({ children, href, className }: SectionTitleParams) {
    return (
        href ?
            <Link
                href={href}
                className={cn('mb-4 flex items-center gap-2 w-fit text-on-surface-muted hover:text-on-surface transition-colors', className)}>
                <Heading className='mb-0 text-on-surface'>{children}</Heading>
                <HiArrowNarrowRight
                    className='w-6 h-5' />
            </Link> :
            <Heading className={cn('mb-4', className)}>{children}</Heading>
    )
}

function Heading({ className, children }: HeadingParams) {
    return (
        <h3 className={cn('font-semibold', className)}>{children}</h3>
    )
}