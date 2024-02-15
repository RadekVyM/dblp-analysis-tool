'use client'

import ListLink from '@/components/ListLink'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { AuthorGroup } from '@/dtos/SavedAuthors'
import { SearchType } from '@/enums/SearchType'
import useAuthors from '@/hooks/authors/useAuthors'
import { createLocalPath } from '@/utils/urls'
import { useMemo } from 'react'
import AuthorCoauthors from '@/components/data-visualisation/AuthorCoauthors'
import AuthorPublications from '@/app/(shell)/author/[id]/(components)/AuthorPublications'
import { DblpPublication } from '@/dtos/DblpPublication'

type PageContentParams = {
    authorGroup: AuthorGroup,
    cachedAuthors: Array<DblpAuthor>
}

export default function PageContent({ authorGroup, cachedAuthors }: PageContentParams) {
    const authorIds = useMemo(() => authorGroup.authors.map((a) => a.id), [authorGroup]);
    const { isLoading, authors, error } = useAuthors(cachedAuthors, authorIds);
    const allPublications = useMemo(() => {
        const map = new Map<string, DblpPublication>();
        authors.forEach((a) => a.publications.forEach((p) => map.set(p.id, p)));

        return [...map.values()];
    }, [authors]);

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

            {
                !isLoading && !error && authors.length > 0 &&
                <>
                    <AuthorPublications
                        publicationsUrl={`/`}
                        publications={allPublications}
                        maxDisplayedCount={3} />
                    <AuthorCoauthors
                        authors={authors} />
                </>
            }
        </>
    );
}