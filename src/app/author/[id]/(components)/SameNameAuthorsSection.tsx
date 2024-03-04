'use client'

import { DblpAuthorHomonym } from '@/dtos/DblpAuthor'
import ListLink from '@/components/ListLink'
import useShowMore from '@/hooks/useShowMore'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import AliasesAffiliations from './AliasesAffiliations'

const DEFAULT_DISPLAYED_ITEMS_COUNT = 5;

type SameNameAuthorsSectionParams = {
    homonyms: Array<DblpAuthorHomonym>
}

/** Page section displaying a list of authors with the same name. */
export default function SameNameAuthorsSection({ homonyms }: SameNameAuthorsSectionParams) {
    const [homonymsDisplayedCount, areHomonymsExpanded, expandHomonyms, collapseHomonyms]
        = useShowMore(DEFAULT_DISPLAYED_ITEMS_COUNT, homonyms.length);

    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>Authors With the Same Name</PageSectionTitle>

            <ul className='flex flex-col gap-2'>
                {homonyms.slice(0, homonymsDisplayedCount).map((homonym) =>
                    <ListLink
                        key={homonym.url}
                        size='sm'
                        href={homonym.url}>
                        <AliasesAffiliations
                            compact={true}
                            info={homonym.info} />
                    </ListLink>)}
            </ul>
            {
                homonyms.length > DEFAULT_DISPLAYED_ITEMS_COUNT &&
                <button
                    className='mx-3 mt-4 text-md hover:underline hover:text-on-surface text-on-surface-muted'
                    onClick={() => areHomonymsExpanded ? collapseHomonyms() : expandHomonyms()}>
                    {areHomonymsExpanded ? 'Show less' : 'Show more'}
                </button>
            }
        </PageSection>
    )
}