'use client'

import { DblpAuthor } from '@/dtos/DblpAuthor'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import useAuthors from '@/hooks/authors/useAuthors'
import { useMemo } from 'react'
import { DblpPublication } from '@/dtos/DblpPublication'
import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'

type PageContentParams = {
    authorGroup: AuthorGroup,
    cachedAuthors: Array<DblpAuthor>
}

export default function PageContent({ authorGroup, cachedAuthors }: PageContentParams) {
    const authorIds = useMemo(() => authorGroup.authors.map((a) => a.id), [authorGroup]);
    const { authors, error } = useAuthors(cachedAuthors, authorIds);
    const allPublications = useMemo(() => {
        const map = new Map<string, DblpPublication>();
        authors.forEach((a) => a.publications.forEach((p) => map.set(p.id, p)));

        return [...map.values()];
    }, [authors]);

    return (
        <>
            {
                !error && authors.length > 0 &&
                <>
                    <GroupedPublicationsList
                        publications={allPublications} />
                </>
            }
        </>
    );
}