import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import SaveButtons from './(components)/SaveButtons'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { isAuthorizedOnServer } from '@/services/auth'
import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import VolumesContent from './(components)/VolumesContent'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { getVenueTypeFromDblpString } from '@/utils/urls'
import { VenueType } from '@/enums/VenueType'
import { DblpVenue } from '@/dtos/DblpVenue'
import VolumesPageContent from './(components)/VolumesPageContent'
import LinksList from '@/components/LinksList'
import { cn } from '@/utils/tailwindUtils'

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

            <header
                className='mb-12'>
                <PageTitle
                    title={venueOrVolume.title}
                    subtitle={venueOrVolume.type ? VENUE_TYPE_TITLE[venueOrVolume.type] : undefined}
                    className='pb-3' />

                <LinksList
                    className={cn('mt-4', isAuthorized ? 'mb-7' : '')}
                    links={venueOrVolume.links} />

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
                        volumes={[venueOrVolume as DblpVenueVolume]} /> :
                    <VolumesPageContent
                        venue={venueOrVolume as DblpVenue} />
            }
        </PageContainer>
    )
}