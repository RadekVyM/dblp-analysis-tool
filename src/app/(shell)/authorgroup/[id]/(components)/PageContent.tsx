'use client'

import ListLink from '@/components/ListLink'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { AuthorGroup } from '@/dtos/SavedAuthors'
import { SearchType } from '@/enums/SearchType'
import useAuthors from '@/hooks/authors/useAuthors'
import { createLocalPath } from '@/utils/urls'
import { useMemo } from 'react'

type PageContentParams = {
    authorGroup: AuthorGroup,
    cachedAuthors: Array<DblpAuthor>
}

export default function PageContent({ authorGroup, cachedAuthors }: PageContentParams) {
    const authorIds = useMemo(() => authorGroup.authors.map((a) => a.id), [authorGroup]);
    const { isLoading, authors } = useAuthors(cachedAuthors, authorIds);

    return (
        <>
            {isLoading && <p>Loading...</p>}
            <ul>
                {authors.map((author) =>
                    <li
                        key={author.id}>
                        <ListLink
                            href={createLocalPath(author.id, SearchType.Author)}>
                            {author.name}
                        </ListLink>
                    </li>)}
            </ul>
        </>
    );
}