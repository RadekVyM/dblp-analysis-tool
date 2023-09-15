import { DblpPublication, DblpPublicationPerson } from '@/shared/models/DblpPublication'
import { Section, SectionTitle } from './Section'
import Link from 'next/link'
import { PublicationTypesStats } from './PublicationsStats'
import { PUBLICATION_TYPE_TEXT_COLOR, PUBLICATION_TYPE_TITLE_SINGULAR } from '@/app/(constants)/publications'
import { cn } from '@/shared/utils/tailwindUtils'
import { MdLibraryBooks } from 'react-icons/md'
import { createLocalPath } from '@/shared/utils/urls'
import { SearchType } from '@/shared/enums/SearchType'
import { PublicationType } from '@/shared/enums/PublicationType'
import LinkArrow from '@/app/(components)/LinkArrow'

type PublicationsParams = {
    className?: string,
    maxDisplayedCount?: number,
    publicationsUrl: string,
    publications: Array<DblpPublication>
}

type PeopleItemsParams = {
    people: Array<DblpPublicationPerson>
}

type PublicationListItemParams = {
    publication: DblpPublication
}

export default function AuthorPublications({ publications, publicationsUrl, maxDisplayedCount, className }: PublicationsParams) {
    return (
        <Section>
            <SectionTitle
                href={publicationsUrl}
                className='text-xl'>
                Publications
            </SectionTitle>

            <h4
                className='sr-only'>
                {maxDisplayedCount ? `${maxDisplayedCount} most recent publications` : 'All publications'}
            </h4>
            <ul
                className='flex flex-col gap-5 pl-4 mb-10'>
                {publications.slice(0, maxDisplayedCount).map((publ) =>
                    <PublicationListItem
                        key={publ.id}
                        publication={publ} />)}
            </ul>

            <h4 className='font-semibold mb-5'>Publication Types</h4>

            <PublicationTypesStats
                scaffoldId='publication-types-stats-1'
                className='mb-10'
                publications={publications.map((publ) => {
                    return {
                        id: publ.id,
                        type: publ.type,
                        date: publ.date
                    }
                })} />

            <h4 className='font-semibold mb-5'>Publication Types over Time</h4>

            <PublicationTypesStats
                scaffoldId='publication-types-stats-2'
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
                            className='link-heading block w-fit text-on-surface-muted hover:text-on-surface transition-colors'
                            href={publication.ee}>
                            <h5
                                className='inline font-semibold text-on-surface'>
                                {publication.title}
                            </h5>
                            <LinkArrow
                                className='w-6 h-5 ml-[-0.1rem] mt-[-0.2rem]' />
                        </Link> :
                        <h5
                            className='font-semibold'>
                            {publication.title}
                        </h5>
                }
                <PublicationInfo
                    publication={publication} />
                {
                    publication.pages &&
                    <p className='text-sm'>{publication.pages.includes('-') ? 'Pages' : 'Page'} {publication.pages}</p>
                }
                <ul
                    className='text-xs flex flex-wrap gap-1'>
                    <PeopleItems
                        people={publication.authors.concat(...publication.editors)} />
                </ul>
                <div
                    className='flex gap-1 mt-1 items-center max-w-full flex-wrap'>
                    <span
                        className={cn('flex gap-2 px-2 py-1 text-xs bg-surface-container text-on-surface-container rounded-lg border border-outline overflow-ellipsis')}>
                        <MdLibraryBooks
                            className={cn(PUBLICATION_TYPE_TEXT_COLOR[publication.type], 'w-4 h-4')} />
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

function PeopleItems({ people }: PeopleItemsParams) {
    return (
        people.map((a, index) =>
            <li
                key={a.id}>
                <Link href={a.url} className='hover:underline'>{a.name}</Link>{index != people.length - 1 && <>, </>}
            </li>)
    )
}

function PublicationInfo({ publication }: PublicationListItemParams) {
    return (
        <p className='text-sm'>
            {
                publication.type == PublicationType.JournalArticles && publication.journal ?
                    <>
                        {publication.volume ? <>Volume {publication.volume} of</> : ''} {
                            publication.venueId ?
                                <Link
                                    className='hover:underline'
                                    href={createLocalPath(publication.venueId, SearchType.Venue) || ''}>
                                    {addMissingNoun(publication.journal, 'journal')}
                                </Link> :
                                addMissingNoun(publication.journal, 'journal')
                        }
                    </> :
                    publication.type == PublicationType.ConferenceAndWorkshopPapers && publication.booktitle ?
                        <>
                            {
                                publication.venueId ?
                                    <Link
                                        className='hover:underline'
                                        href={createLocalPath(publication.venueId, SearchType.Venue) || ''}>
                                        {addMissingNoun(publication.booktitle, 'conference')}
                                    </Link> :
                                    addMissingNoun(publication.booktitle, 'conference')
                            }
                        </> :
                        publication.booktitle &&
                        <>
                            {
                                publication.venueId ?
                                    <Link
                                        className='hover:underline'
                                        href={createLocalPath(publication.venueId, SearchType.Venue) || ''}>
                                        {publication.booktitle}
                                    </Link> :
                                    publication.booktitle
                            }
                        </>
            }
        </p>
    )
}

function addMissingNoun(title: string, noun: string) {
    return `${title}${title.toLocaleLowerCase().includes(noun) ? '' : ` ${noun}`}`
}