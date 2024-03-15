import useSWRImmutable from 'swr/immutable'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import waitForNextFetchClient from '@/services/waitForNextFetchClient';

/**
 * Hook that fetches a venue volume with a specified ID.
 * @param venueId Venue ID
 * @param volumeId Volume ID
 * @param shouldFetch Whether the fetch should be performed
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
    await waitForNextFetchClient();

    const response = await fetch(url);
    return await response.json() as DblpVenueVolume;
}