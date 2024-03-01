import { cn } from '@/utils/tailwindUtils'
import Link from 'next/link'
import LinkArrow from '../LinkArrow'

type PageTitleParams = {
    annotation?: string,
    className?: string,
    subtitleHref?: string,
    subtitle?: string,
    titleHref?: string,
    title: string
}

type HeadingParams = {
    className?: string,
    children: React.ReactNode
}

/** Title/heading of a page that can act as a link. */
export default function PageTitle({ annotation, title, titleHref, subtitle, subtitleHref, className }: PageTitleParams) {
    return (
        <div
            className={cn('flex flex-col gap-1 pt-8 pb-6', className)}>
            {
                annotation &&
                <small className='uppercase text-primary font-bold'>{annotation}</small>
            }
            {
                titleHref ?
                    <div>
                        <Link
                            href={titleHref}
                            prefetch={false}
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
            {
                subtitleHref && subtitle ?
                    <div>
                        <Link
                            href={subtitleHref}
                            prefetch={false}
                            className='link-heading text-on-surface-muted hover:text-on-surface transition-colors leading-normal'>
                            <Subheading
                                className='inline w-fit'>{subtitle}
                            </Subheading>
                            <LinkArrow
                                className='w-6 h-5 ml-[-0.2rem] mt-[-0.25rem]' />
                        </Link>
                    </div> :
                    <>
                        {subtitle && <Subheading>{subtitle}</Subheading>}
                    </>
            }
        </div>
    )
}

function Heading({ children, className }: HeadingParams) {
    return (
        <h2 className={cn('font-extrabold text-3xl text-on-surface', className)}>{children}</h2>
    )
}

function Subheading({ children, className }: HeadingParams) {
    return (
        <span className={cn('font-bold text-lg text-on-surface', className)}>{children}</span>
    )
}