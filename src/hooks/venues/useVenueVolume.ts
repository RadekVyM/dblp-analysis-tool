import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'

/**
 * Hook that fetches a venue volume with a specified ID.
 * @param venueId Venue ID
 * @param volumeId Volume ID
 * @returns Fetched data and state variables
 */
export default function useVenueVolume(venueId: string, volumeId: string, shouldFetch: boolean) {
    const { data, error, isLoading } = useSWRImmutable(
        () => shouldFetch ? `/api/venue/${venueId}/volume/${volumeId}` : false,
        volumeFetcher);

    return {
        volume: data,
        isLoading,
        error: error
    };
}

/**
 * Fetches a venue volume on the client.
 * @param url URL of the API endpoint
 * @returns An object of a fetched venue volume
 */
async function volumeFetcher(url: string) {
    const response = await fetch(url);
    return await response.json() as DblpVenueVolume;
}