'use client'

import ListButton, { ListButtonParams } from '@/components/inputs/ListButton'
import { DblpPublicationPerson } from '@/dtos/DblpPublication'

type AuthorListItemParams = {
    person: DblpPublicationPerson,
    after?: React.ReactNode,
    onAuthorClick: (id: string | null) => void,
    onHoverChange: (id: string, isHovered: boolean) => void
} & ListButtonParams

/** List item for an author in a list that displays authors in the coauthors graph. */
export default function AuthorListItem({ person, onAuthorClick, onHoverChange, after, ...rest }: AuthorListItemParams) {
    return (
        <li
            onPointerEnter={() => onHoverChange(person.id, true)}
            onPointerLeave={() => onHoverChange(person.id, false)}>
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