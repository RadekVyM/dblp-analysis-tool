'use client'

import ListButton, { ListButtonParams } from '@/components/ListButton'
import { DblpPublicationPerson } from '@/dtos/DblpPublication'
import { useEffect, useRef } from 'react'
import { useHover } from 'usehooks-ts'

type AuthorListItemParams = {
    person: DblpPublicationPerson,
    after?: React.ReactNode,
    onAuthorClick: (id: string | null) => void,
    onHoverChange: (id: string, isHovered: boolean) => void
} & ListButtonParams

/** List item for an author in a list that displays authors in the coauthors graph. */
export default function AuthorListItem({ person, onAuthorClick, onHoverChange, after, ...rest }: AuthorListItemParams) {
    const listItemRef = useRef<HTMLLIElement>(null);
    const isHovered = useHover(listItemRef);

    useEffect(() => {
        onHoverChange(person.id, isHovered);
    }, [isHovered]);

    return (
        <li
            ref={listItemRef}>
            <ListButton
                {...rest}
                size='sm'
                surface='container'
                onClick={() => onAuthorClick(person.id)}
                className='w-full inline'>
                {person.name}
                {after}
            </ListButton>
        </li>
    )
}