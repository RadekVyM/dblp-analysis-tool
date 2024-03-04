import { DblpPublication, DblpPublicationPerson } from '@/dtos/DblpPublication'
import Link from 'next/link'
import { PUBLICATION_TYPE_TEXT_COLOR, PUBLICATION_TYPE_TITLE_SINGULAR } from '@/constants/client/publications'
import { cn } from '@/utils/tailwindUtils'
import { MdLibraryBooks } from 'react-icons/md'
import LinkArrow from '@/components/LinkArrow'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { PublicationType } from '@/enums/PublicationType'

type PublicationListItemParams = {
    publication: DblpPublication
}

type PeopleItemsParams = {
    people: Array<DblpPublicationPerson>
}

/** Displays a publication as an item in a list of publications. */
export default function PublicationListItem({ publication }: PublicationListItemParams) {
    return (
        <li
            className='list-disc marker:text-primary'>
            <article
                className='inline-flex flex-col gap-1'>
                {
                    publication.ee ?
                        <Link
                            prefetch={false}
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
                        {publication.month && `${publication.month} `}{publication.year}
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
                <Link
                    prefetch={false}
                    href={a.url}
                    className='hover:underline'>
                    {a.name}</Link>{index != people.length - 1 && <>, </>}
            </li>)
    )
}

function PublicationInfo({ publication }: PublicationListItemParams) {
    return (
        <p className='text-sm'>
            {
                publication.type == PublicationType.JournalArticles && publication.journal ?
                    <>
                        {
                            publication.venueId ?
                                <Link
                                    prefetch={false}
                                    className='hover:underline'
                                    href={createLocalVenuePath(publication)}>
                                    {publication.volume ? <>Volume {publication.volume} of </> : ''}{addMissingNoun(publication.journal, 'journal')}
                                </Link> :
                                addMissingNoun(publication.journal, 'journal')
                        }
                    </> :
                    publication.type == PublicationType.ConferenceAndWorkshopPapers && publication.booktitle ?
                        <>
                            {
                                publication.venueId ?
                                    <Link
                                        prefetch={false}
                                        className='hover:underline'
                                        href={createLocalVenuePath(publication)}>
                                        {publication.volume ? <>Volume {publication.volume} of </> : ''}{addMissingNoun(publication.booktitle, 'conference')}
                                    </Link> :
                                    addMissingNoun(publication.booktitle, 'conference')
                            }
                        </> :
                        publication.booktitle &&
                        <>
                            {
                                publication.venueId ?
                                    <Link
                                        prefetch={false}
                                        className='hover:underline'
                                        href={createLocalVenuePath(publication)}>
                                        {publication.volume ? <>Volume {publication.volume} of </> : ''}{publication.booktitle}
                                    </Link> :
                                    publication.booktitle
                            }
                        </>
            }
            {
                publication.seriesVenueId && publication.series &&
                <>
                    {
                        (publication.journal || publication.booktitle) &&
                        <span>, </span>
                    }
                    <Link
                        prefetch={false}
                        className='hover:underline'
                        href={createLocalPath(publication.seriesVenueId, SearchType.Venue)}>
                        {publication.series}
                    </Link>
                </>
            }
        </p>
    )
}

function createLocalVenuePath(publication: DblpPublication) {
    if (!publication.venueId) {
        return '';
    }

    return createLocalPath(publication.venueId, SearchType.Venue, publication.volumeId) || '';
}

function addMissingNoun(title: string, noun: string) {
    return `${title}${title.toLocaleLowerCase().includes(noun) ? '' : ` ${noun}`}`
}