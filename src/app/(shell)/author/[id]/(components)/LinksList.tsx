'use client'

import Button from '@/components/Button'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MdOutlinePublic } from 'react-icons/md'

type LinksListParams = {
    links: Array<
        {
            url: string,
            title: string,
            icon: string
        }>
}

type IconParams = {
    title: string,
    src: string
}

export default function LinksList({ links }: LinksListParams) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    return (
        <ul
            className='flex flex-wrap gap-2'>
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

    return !useDefaultIcon ?
        (
            <Image
                aria-hidden
                width={16} height={16}
                src={src}
                alt={title}
                className='rounded-sm'
                onError={() => setUseDefaultIcon(true)} />
        ) :
        (
            <MdOutlinePublic
                className='self-center w-4 h-4 text-on-surface-container-muted' />
        )
}