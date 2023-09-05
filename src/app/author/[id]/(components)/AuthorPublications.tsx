import { DblpPublication } from '@/shared/models/DblpPublication'
import { Section, SectionTitle } from './Section'
import Link from 'next/link'
import { PublicationTypesStats } from './PublicationsStats'
import { PUBLICATION_TYPE_COLOR, PUBLICATION_TYPE_TITLE_SINGULAR } from '@/app/(constants)/publications'
import { cn } from '@/shared/utils/tailwindUtils'
import { MdLibraryBooks, MdOutlineEast } from 'react-icons/md'
import GroupedPublicationsList from './GroupedPublicationsList'

type PublicationsParams = {
    className?: string,
    maxDisplayedCount?: number,
    publicationsUrl: string,
    publications: Array<DblpPublication>
}

type PublicationListItemParams = {
    publication: DblpPublication
}

export default function AuthorPublications({ publications, publicationsUrl, maxDisplayedCount, className }: PublicationsParams) {
    return (
        <Section>
            <Link
                href={publicationsUrl}
                className='flex items-center gap-2 w-fit'>
                <SectionTitle className='text-xl'>Publications</SectionTitle>
                <MdOutlineEast
                    className='mb-4 w-6 h-5' />
            </Link>

            <h4
                className='sr-only'>
                {maxDisplayedCount ? `${maxDisplayedCount} most recent publications` : 'All publications'}
            </h4>
            <ul
                className='flex flex-col gap-4 pl-4 mb-10'>
                {publications.slice(0, maxDisplayedCount).map((publ) =>
                    <PublicationListItem
                        key={publ.id}
                        publication={publ} />)}
            </ul>

            <PublicationTypesStats
                publications={publications.map((publ) => {
                    return {
                        id: publ.id,
                        type: publ.type,
                        date: publ.date
                    }
                })} />
        </Section>
    )
}

export function PublicationListItem({ publication }: PublicationListItemParams) {
    return (
        <li
            className='list-disc marker:text-primary'>
            <article
                className='inline-flex flex-col gap-1'>
                {
                    publication.ee ?
                        <Link
                            href={publication.ee}>
                            <h5
                                className='font-semibold'>
                                {publication.title}
                            </h5>
                        </Link> :
                        <h4
                            className='font-semibold'>
                            {publication.title}
                        </h4>
                }
                <ul
                    className='text-xs flex flex-wrap gap-1'>
                    {publication.authors.map((a, index) =>
                        <li
                            key={a.id}>
                            <Link href={a.url} className='hover:underline'>{a.name}</Link>{index != publication.authors.length - 1 && <>, </>}
                        </li>)}
                </ul>
                <div
                    className='flex gap-1 mt-1'>
                    <span
                        className={cn('flex gap-2 px-2 py-1 text-xs bg-surface-container text-on-surface-container rounded-lg border border-outline')}>
                        <MdLibraryBooks
                            className={cn(PUBLICATION_TYPE_COLOR[publication.type], 'w-4 h-4')} />
                        {PUBLICATION_TYPE_TITLE_SINGULAR[publication.type]}
                    </span>
                    <span
                        className='px-2 py-1 bg-surface-container text-on-surface-container text-xs rounded-lg border border-outline'>
                        {publication.year}
                    </span>
                </div>
            </article>
        </li>
    )
}
