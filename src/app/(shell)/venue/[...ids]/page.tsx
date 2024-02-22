import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import { getVenueTypeFromDblpString } from '@/utils/urls'
import { VenueType } from '@/enums/VenueType'
import VenueOrVolumePage from './(components)/VenueOrVolumePage'
import PublicationsPage from './(components)/PublicationsPage'

export default async function VenuePage({ params: { ids }, searchParams }: VenuePageParams) {
    const venueId = ids[0];
    const venueType = getVenueTypeFromDblpString(venueId);
    const volumeId = ids.length > 1 && venueType === VenueType.Book ?
        ids[1] :
        undefined;
    const isPublicationsPage = (ids.length > 1 && ids[1].toLowerCase() === 'publications') ||
        (ids.length > 2 && ids[2].toLowerCase() === 'publications');
    const venueOrVolume = await fetchVenueOrVolume(venueId, volumeId);

    if (isPublicationsPage) {
        return (
            <PublicationsPage
                venueId={venueId}
                volumeId={volumeId}
                venueOrVolume={venueOrVolume} />
        )
    }
    else {
        return (
            <VenueOrVolumePage
                venueId={venueId}
                volumeId={volumeId}
                venueOrVolume={venueOrVolume}
                venueType={venueType} />
        )
    }
}