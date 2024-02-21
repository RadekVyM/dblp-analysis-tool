import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import SaveButtons from './(components)/SaveButtons'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { isAuthorizedOnServer } from '@/services/auth'
import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import VolumesContent from './(components)/VolumesContent'
import { DblpVenuevolume } from '@/dtos/DblpVenueVolume'

export default async function ConferencePage({ params: { id }, searchParams }: VenuePageParams) {
    const venueOrVolume = await fetchVenueOrVolume(id);
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <PageContainer>
            {
                isAuthorized &&
                <AddToRecentlySeen
                    id={id}
                    title={venueOrVolume.title} />
            }

            <header>
                <PageTitle
                    title={venueOrVolume.title}
                    subtitle={venueOrVolume.type ? VENUE_TYPE_TITLE[venueOrVolume.type] : undefined}
                    className='pb-3' />

                {
                    isAuthorized &&
                    <SaveButtons
                        title={venueOrVolume.title}
                        venueId={venueOrVolume.id} />
                }
            </header>

            {
                venueOrVolume.venueVolumeType === 'Volume' ?
                    <VolumesContent
                        volumes={[venueOrVolume as DblpVenuevolume]} /> :
                    <span>Venue</span>
            }
        </PageContainer>
    )
}