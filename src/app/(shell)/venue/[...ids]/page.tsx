import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import SaveButtons from './(components)/SaveButtons'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { isAuthorizedOnServer } from '@/services/auth'
import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import VolumesContent from './(components)/VolumesContent'
import { DblpVenuevolume } from '@/dtos/DblpVenueVolume'
import { getVenueTypeFromDblpString } from '@/utils/urls'
import { VenueType } from '@/enums/VenueType'

export default async function ConferencePage({ params: { ids }, searchParams }: VenuePageParams) {
    const venueId = ids[0];
    const venueType = getVenueTypeFromDblpString(venueId);
    const volumeId = ids.length > 1 && venueType === VenueType.Book ?
        ids[1] :
        undefined;
    const venueOrVolume = await fetchVenueOrVolume(venueId, volumeId);
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <PageContainer>
            {
                isAuthorized && venueType !== VenueType.Book &&
                <AddToRecentlySeen
                    id={venueId}
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