import CoauthorsSection from '@/components/data-visualisation/sections/CoauthorsSection'
import PublicationsStatsSection from '@/components/data-visualisation/sections/PublicationsStatsSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { SearchType } from '@/enums/SearchType'
import { createLocalPath } from '@/utils/urls'

type VenueContentParams = {
    id: string,
    venueId: string,
    publications: Array<DblpPublication>
}

/** Displays statistics of a venue. */
export default function VenueContent({ id, venueId, publications }: VenueContentParams) {
    return (
        <>
            <PublicationsStatsSection
                id={`${id}-publications`}
                publicationsUrl={`${createLocalPath(venueId, SearchType.Venue)}/publications`}
                publications={publications}
                maxDisplayedCount={3} />
            <CoauthorsSection
                id={`${id}-coauthors`}
                title={'Authors'}
                authors={[]}
                publications={publications}
                tableCoauthorsExplanation={'Total number of coauthors of publications from the venue'}
                tablePublicationsExplanation={'Total number of unique publications from the venue'} />
        </>
    )
}