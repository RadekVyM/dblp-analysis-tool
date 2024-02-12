'use client'

import { AuthorGroup } from '@/dtos/SavedAuthors'
import useAuthors from '@/hooks/authors/useAuthors'
import { useMemo } from 'react'

export default function FetchedAuthors({ authorGroup }: { authorGroup: AuthorGroup }) {
    const authorIds = useMemo(() => authorGroup.authors.map((a) => a.id), [authorGroup]);
    const { isLoading, authors } = useAuthors([], authorIds);

    return (
        <>
            {isLoading && <p>Loading...</p>}
            <ul>
                {authors.map((author, index) =>
                    <li key={`${author.id}${index}`}>
                        {author.name}
                    </li>)}
            </ul>
        </>
    );
}