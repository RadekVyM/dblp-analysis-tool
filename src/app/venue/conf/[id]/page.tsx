import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'
import { fetchVenue } from '@/server/fetching/venues'
import AddToRecentlySeen from '../../(components)/AddToRecentlySeen'
import Bookmarks from '../../(components)/Bookmarks'

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
                    subtitle='Conference'
                    className='pb-3' />

                <Bookmarks
                    title={venue.title}
                    venueId={venue.id} />
            </header>
        </PageContainer>
    )
}