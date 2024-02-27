import { DblpPublication, getVenueTitle } from '@/dtos/DblpPublication'
import { PageSection, PageSectionTitle, PageSubsectionTitle } from '@/components/shell/PageSection'
import PublicationTypesStats from '@/components/data-visualisation/stats/PublicationTypesStats'
import ItemsStats from '@/components/ItemsStats'
import PublicationsOverTimeStats from '@/components/data-visualisation/stats/PublicationsOverTimeStats'
import PublicationVenuesStats from '@/components/data-visualisation/stats/PublicationVenuesStats'
import PublicationListItem from '@/components/publications/PublicationListItem'

type PublicationsStatsSectionParams = {
    className?: string,
    maxDisplayedCount?: number,
    title?: React.ReactNode,
    children?: React.ReactNode,
    publicationsUrl: string,
    publications: Array<DblpPublication>
}

/** Page section that displays all the publications statistics. */
export default function PublicationsStatsSection({ publications, publicationsUrl, maxDisplayedCount, title, children, className }: PublicationsStatsSectionParams) {
    return (
        <PageSection
            className={className}>
            <PageSectionTitle
                href={publicationsUrl}
                className='text-xl'>
                {title || 'Publications'}
            </PageSectionTitle>

            <ItemsStats
                className='mb-6'
                totalCount={publications.length} />

            <PageSubsectionTitle>Last Added</PageSubsectionTitle>
            <ul
                className='flex flex-col gap-5 pl-4 mb-10'>
                {publications.slice(0, maxDisplayedCount).map((publ) =>
                    <PublicationListItem
                        key={publ.id}
                        publication={publ} />)}
            </ul>

            <PageSubsectionTitle>Publication Types</PageSubsectionTitle>

            <PublicationTypesStats
                scaffoldId='publication-types-stats'
                className='mb-10'
                publications={publications.map((publ) => ({
                    id: publ.id,
                    type: publ.type,
                    date: publ.date
                }))} />

            <PageSubsectionTitle>Publications Over Time</PageSubsectionTitle>

            <PublicationsOverTimeStats
                scaffoldId='publications-over-time-stats'
                className='mb-10'
                publications={publications.map((publ) => ({
                    id: publ.id,
                    type: publ.type,
                    year: publ.year
                }))}
                publicationsUrl={publicationsUrl} />

            <PageSubsectionTitle>Publication Venues</PageSubsectionTitle>

            <PublicationVenuesStats
                scaffoldId='publication-venues-stats'
                className={children ? 'mb-10' : ''}
                publications={publications.map((publ) => ({
                    id: publ.id,
                    type: publ.type,
                    venueId: publ.venueId || null,
                    venueTitle: getVenueTitle(publ)
                }))} />

            {children}
        </PageSection>
    )
}