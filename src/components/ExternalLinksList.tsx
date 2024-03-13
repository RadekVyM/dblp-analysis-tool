'use client'

import Button from '@/components/inputs/Button'
import { ExternalLink } from '@/dtos/ExternalLink'
import { cn } from '@/utils/tailwindUtils'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MdOutlinePublic } from 'react-icons/md'

type ExternalLinksListParams = {
    links: Array<ExternalLink>,
    className?: string
}

type IconParams = {
    title: string,
    src: string
}

/** List of links to external pages specified by the ExternalLink type. */
export default function ExternalLinksList({ links, className }: ExternalLinksListParams) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    return (
        <ul
            className={cn('flex flex-wrap gap-2', className)}>
            {links.map((link) =>
                <li
                    key={link.url}>
                    <Button
                        href={link.url}
                        size='xs' variant='outline'
                        className='px-2 py-1 h-auto gap-x-2'>
                        {
                            isClient &&
                            <Icon
                                src={link.icon}
                                title={link.title} />
                        }
                        {link.title}
                    </Button>
                </li>)}
        </ul>
    )
}

function Icon({ src, title }: IconParams) {
    const [useDefaultIcon, setUseDefaultIcon] = useState(false);

    useEffect(() => setUseDefaultIcon(false), [src]);

    if (useDefaultIcon) {
        return (
            <MdOutlinePublic
                className='self-center w-4 h-4 text-on-surface-container-muted' />
        )
    }

    return (
        <Image
            aria-hidden
            width={16} height={16}
            src={src}
            alt={title}
            className='rounded-sm'
            onError={() => setUseDefaultIcon(true)} />
    )
}