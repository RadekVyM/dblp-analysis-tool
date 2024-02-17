import LinkArrow from '@/components/LinkArrow'
import { cn } from '@/utils/tailwindUtils'
import Link from 'next/link'

type SectionTitleParams = {
    className?: string,
    href?: string,
    children: React.ReactNode
}

type HeadingParams = {
    className?: string,
    children: React.ReactNode
}

/** Section of a page. */
export function PageSection({ children }: { children: React.ReactNode }) {
    return (
        <section className='mb-12'>{children}</section>
    )
}

/** Title of a page section that can act as a link. */
export function PageSectionTitle({ children, href, className }: SectionTitleParams) {
    return (
        href ?
            <Link
                href={href}
                className={cn('link-heading block mb-5 w-fit text-on-surface-muted hover:text-on-surface transition-colors', className)}>
                <Heading className='inline mb-0 text-on-surface'>{children}</Heading>
                <LinkArrow
                    className='w-6 h-5 mt-[-0.2rem]' />
            </Link> :
            <Heading className={cn('mb-5', className)}>{children}</Heading>
    )
}

function Heading({ className, children }: HeadingParams) {
    return (
        <h3 className={cn('font-semibold', className)}>{children}</h3>
    )
}