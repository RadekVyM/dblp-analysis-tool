import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import { fetchVenue } from '@/services/venues/venues'
import AddToRecentlySeen from '../(components)/AddToRecentlySeen'
import Bookmarks from '../(components)/Bookmarks'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'

export default async function ConferencePage({ params: { id }, searchParams }: VenuePageParams) {
    const venue = await fetchVenue(id);

    return (
        <PageContainer>
            <AddToRecentlySeen
                id={id}
                title={venue.title} />

            <header>
                <PageTitle
                    title={venue.title}
                    subtitle={venue.type ? VENUE_TYPE_TITLE[venue.type] : undefined}
                    className='pb-3' />

                <Bookmarks
                    title={venue.title}
                    venueId={venue.id} />
            </header>
        </PageContainer>
    )
}