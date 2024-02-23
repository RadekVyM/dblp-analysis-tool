import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import { cacheRecord, tryGetCachedRecord } from './cache'

/**
 * Saves a venue or venue volume to the cache (database).
 * @param value Object representing the venue or venue volume
 * @param venueId Venue ID
 * @param additionalVolumeId Venue volume ID
 */
export async function cacheVenueOrVolume(value: DblpVenueBase, venueId: string, additionalVolumeId?: string) {
    const recordId = createRecordId(venueId, additionalVolumeId);
    return await cacheRecord(recordId, value);
}

/**
 * Tries to retreive a venue or venue volume from the cache (database).
 * @param venueId Venue ID
 * @param additionalVolumeId Venue volume ID
 * @returns Object representing the venue or venue volume or null if no record was found
 */
export async function tryGetCachedVenueOrVolume(venueId: string, additionalVolumeId?: string) {
    const recordId = createRecordId(venueId, additionalVolumeId);
    return await tryGetCachedRecord<DblpVenueBase>(recordId);
}

function createRecordId(venueId: string, additionalVolumeId: string | undefined) {
    return venueId + (additionalVolumeId ? `/${additionalVolumeId}` : '');
}