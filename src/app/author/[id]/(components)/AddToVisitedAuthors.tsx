'use client'

import useVisitedAuthors from '@/hooks/visits/useVisitedAuthors'
import { useEffectOnce } from 'usehooks-ts'

type AddToVisitedAuthorsParams = {
    id: string,
    title: string
}

/** Client component that adds an author to the list of visited authors. */
export default function AddToVisitedAuthors({ id, title }: AddToVisitedAuthorsParams) {
    const { visitedAuthor } = useVisitedAuthors();

    useEffectOnce(() => {
        visitedAuthor(id, title);
    });

    return (
        <></>
    )
}