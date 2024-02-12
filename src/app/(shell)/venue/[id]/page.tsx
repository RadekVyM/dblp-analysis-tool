import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import SaveButtons from './(components)/SaveButtons'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { isAuthorizedOnServer } from '@/services/auth/server'
import { fetchVenue } from '@/services/venues/fetch-server'

export default async function ConferencePage({ params: { id }, searchParams }: VenuePageParams) {
    const venue = await fetchVenue(id);
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <PageContainer>
            {
                isAuthorized &&
                <AddToRecentlySeen
                    id={id}
                    title={venue.title} />
            }

            <header>
                <PageTitle
                    title={venue.title}
                    subtitle={venue.type ? VENUE_TYPE_TITLE[venue.type] : undefined}
                    className='pb-3' />

                {
                    isAuthorized &&
                    <SaveButtons
                        title={venue.title}
                        venueId={venue.id} />
                }
            </header>
        </PageContainer>
    )
}