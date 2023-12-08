'use client'

import ListButton from '@/components/ListButton'
import { DblpPublicationPerson } from '@/dtos/DblpPublication'
import { useEffect, useRef } from 'react'
import { useHover } from 'usehooks-ts'

type AuthorListItemParams = {
    person: DblpPublicationPerson,
    onAuthorClick: (id: string | null) => void,
    onHoverChange: (id: string, isHovered: boolean) => void
}

export default function AuthorListItem({ person, onAuthorClick, onHoverChange }: AuthorListItemParams) {
    const listItemRef = useRef<HTMLLIElement>(null);
    const isHovered = useHover(listItemRef);

    useEffect(() => {
        onHoverChange(person.id, isHovered);
    }, [isHovered]);

    return (
        <li
            ref={listItemRef}>
            <ListButton
                size='sm'
                surface='container'
                onClick={() => onAuthorClick(person.id)}
                className='w-full'>
                {person.name}
            </ListButton>
        </li>
    )
}