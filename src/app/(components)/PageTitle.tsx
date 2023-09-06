import { cn } from '@/shared/utils/tailwindUtils'
import Link from 'next/link'
import { MdOutlineEast } from 'react-icons/md'
import { FaArrowRight } from 'react-icons/fa'
import { HiArrowNarrowRight } from 'react-icons/hi'

type PageTitleParams = {
    subtitle?: string,
    className?: string,
    titleHref?: string,
    title: React.ReactNode
}

type HeadingParams = {
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
                    <Link
                        href={titleHref}
                        className='flex items-center gap-3 w-fit text-on-surface-muted hover:text-on-surface transition-colors'>
                        <Heading>{title}</Heading>
                        <HiArrowNarrowRight
                            className='w-8 h-7' />
                    </Link> :
                    <Heading>{title}</Heading>
            }
        </div>
    )
}

function Heading({ children }: HeadingParams) {
    return (
        <h2 className='font-extrabold text-3xl text-on-surface w-fit'>{children}</h2>
    )
}