'use client'

import Button from "@/app/(components)/Button";
import Image from "next/image";
import { useEffect, useState } from "react";

type LinksListParams = {
    links: Array<
        {
            url: string,
            title: string,
            icon: string
        }>
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
                            <Image
                                aria-hidden
                                width={16} height={16}
                                src={link.icon}
                                alt={link.title}
                                className='rounded-sm' />
                        }
                        {link.title}
                    </Button>
                </li>)}
        </ul>
    )
} 