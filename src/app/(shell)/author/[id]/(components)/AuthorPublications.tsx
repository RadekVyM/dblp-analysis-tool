import { DblpPublication, getVenueTitle } from '@/dtos/DblpPublication'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import PublicationTypesStats from '@/components/data-visualisation/stats/PublicationTypesStats'
import ItemsStats from '@/components/ItemsStats'
import PublicationsOverTimeStats from '@/components/data-visualisation/stats/PublicationsOverTimeStats'
import PublicationVenuesStats from '@/components/data-visualisation/stats/PublicationVenuesStats'
import PublicationListItem from '@/components/publications/PublicationListItem'

type PublicationsParams = {
    className?: string,
    maxDisplayedCount?: number,
    publicationsUrl: string,
    publications: Array<DblpPublication>
}

export default function AuthorPublications({ publications, publicationsUrl, maxDisplayedCount, className }: PublicationsParams) {
    return (
        <PageSection>
            <PageSectionTitle
                href={publicationsUrl}
                className='text-xl'>
                Publications
            </PageSectionTitle>

            <ItemsStats
                className='mb-6'
                totalCount={publications.length} />

            <h4
                className='font-semibold mb-5'>
                Last Added
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
                scaffoldId='publication-types-stats'
                className='mb-10'
                publications={publications.map((publ) => {
                    return {
                        id: publ.id,
                        type: publ.type,
                        date: publ.date
                    }
                })} />

            <h4 className='font-semibold mb-5'>Publications Over Time</h4>

            <PublicationsOverTimeStats
                scaffoldId='publications-over-time-stats'
                className='mb-10'
                publications={publications.map((publ) => {
                    return {
                        id: publ.id,
                        type: publ.type,
                        year: publ.year
                    }
                })} />

            <h4 className='font-semibold mb-5'>Publication Venues</h4>

            <PublicationVenuesStats
                scaffoldId='publication-venues-stats'
                publications={publications.map((publ) => {
                    const title = getVenueTitle(publ);

                    return {
                        id: publ.id,
                        type: publ.type,
                        venueId: publ.venueId || null,
                        venueTitle: getVenueTitle(publ)
                    }
                })} />
        </PageSection>
    )
}