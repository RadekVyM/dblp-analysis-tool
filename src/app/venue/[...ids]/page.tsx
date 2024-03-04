import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import { getVenueTypeFromDblpString } from '@/utils/urls'
import VenuePage from './(components)/VenuePage'
import VenuePublicationsPage from './(components)/VenuePublicationsPage'
import { parsePublicationsSearchParams } from '@/utils/publicationsSearchParams'
import { PublicationsSearchParams } from '@/dtos/PublicationsSearchParams'

type VenuePagesParams = {
    params: {
        ids: Array<string>
    },
    searchParams: { volumeId?: Array<string> | string } & PublicationsSearchParams
}

/**
 * Processes the URL parameters and decides what page should be displayed.
 * This approach is used because variable count of URL parameters is used - file based routing cannot be used after [...ids].
*/
export default async function VenuePages({ params: { ids }, searchParams }: VenuePagesParams) {
    const { years, types, venues, authors } = parsePublicationsSearchParams(searchParams);
    const defaultSelectedVolumeIds = searchParams.volumeId ?
        (typeof searchParams.volumeId === 'string' ? [searchParams.volumeId] : searchParams.volumeId) :
        undefined;
    const isPublicationsPage = (ids.length > 1 && ids[1].toLowerCase() === 'publications') ||
        (ids.length > 2 && ids[2].toLowerCase() === 'publications');
    const venueId = ids[0];
    const venueType = getVenueTypeFromDblpString(venueId);
    const volumeId = ids.length > 1 && ids[1].toLowerCase() !== 'publications' ?
        ids[1] :
        undefined;
    const venueOrVolume = await fetchVenueOrVolume(venueId, volumeId);

    if (isPublicationsPage) {
        return (
            <VenuePublicationsPage
                venueId={venueId}
                volumeId={volumeId}
                venueOrVolume={venueOrVolume}
                defaultSelectedYears={years}
                defaultSelectedTypes={types}
                defaultSelectedVenueIds={venues}
                defaultSelectedVolumeIds={defaultSelectedVolumeIds}
                defaultSelectedAuthors={authors} />
        )
    }
    else {
        return (
            <VenuePage
                venueId={venueId}
                volumeId={volumeId}
                venueOrVolume={venueOrVolume}
                venueType={venueType}
                defaultSelectedVolumeIds={defaultSelectedVolumeIds} />
        )
    }
}