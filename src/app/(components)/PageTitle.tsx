import { cn } from '@/shared/utils/tailwindUtils'
import Link from 'next/link'
import { HiArrowNarrowRight } from 'react-icons/hi'
import LinkArrow from './LinkArrow'

type PageTitleParams = {
    subtitle?: string,
    className?: string,
    titleHref?: string,
    title: string
}

type HeadingParams = {
    className?: string,
    children: React.ReactNode
}

export default function PageTitle({ subtitle, title, titleHref, className }: PageTitleParams) {
    return (
        <div
            className={cn('flex flex-col gap-1 pt-8 pb-6', className)}>
            {
                subtitle &&
                <small className='uppercase text-primary font-bold'>{subtitle}</small>
            }
            {
                titleHref ?
                    <div>
                        <Link
                            href={titleHref}
                            className='link-heading text-on-surface-muted hover:text-on-surface transition-colors leading-normal'>
                            <Heading
                                className='inline w-fit'>{title}
                            </Heading>
                            <LinkArrow
                                className='w-8 h-8 ml-1 mt-[-0.75rem]' />
                        </Link>
                    </div> :
                    <Heading>{title}</Heading>
            }
        </div>
    )
}

function Heading({ children, className }: HeadingParams) {
    return (
        <h2 className={cn('font-extrabold text-3xl text-on-surface', className)}>{children}</h2>
    )
}