import 'server-only'
import CachedJsonRecord, { CachedJsonRecordSchema } from '@/db/models/CachedJsonRecord'
import connectDb from '@/db/mongodb'
import { CACHED_RECORD_MAX_AGE } from '@/constants/cache'

/**
 * Saves a record to the cache (database).
 * @param recordId ID of the record
 * @param record Object representing the record
 */
export async function cacheRecord<T>(recordId: string, record: T): Promise<void> {
    await connectDb();

    const cachedRecord = await CachedJsonRecord.findOne<CachedJsonRecordSchema>({ recordId: recordId });

    if (cachedRecord) {
        await CachedJsonRecord.findByIdAndUpdate<CachedJsonRecordSchema>(
            cachedRecord._id,
            {
                recordId: recordId,
                jsonObject: JSON.stringify(record)
            });
    }
    else {
        const newRecord = await CachedJsonRecord.create<CachedJsonRecordSchema>(
            {
                recordId: recordId,
                jsonObject: JSON.stringify(record)
            });
    }
}

/**
 * Tries to retreive a record from the cache (database).
 * @param recordId ID of the record
 * @returns Object representing the record or null if no record was found
 */
export async function tryGetCachedRecord<T>(recordId: string): Promise<T | null> {
    await connectDb();

    const cachedRecord = await CachedJsonRecord.findOne<CachedJsonRecordSchema>({ recordId: recordId });
    const time = new Date().getTime() - CACHED_RECORD_MAX_AGE;
    const updatedAtTime = cachedRecord?.updatedAt?.getTime();

    if (cachedRecord && updatedAtTime && updatedAtTime >= time) {
        return JSON.parse(cachedRecord.jsonObject) as T;
    }

    return null;
}

/**
 * Tries to retreive some records from the cache (database).
 * @param recordIds IDs of the records
 * @returns Array of found records
 */
export async function tryGetCachedRecords<T>(recordIds: Array<string>): Promise<Array<T>> {
    const records: Array<T> = [];

    for (const id of recordIds) {
        const record = await tryGetCachedRecord<T>(id);

        if (record) {
            records.push(record);
        }
    }

    return records;
}