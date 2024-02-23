import 'server-only'
import { WAITING_TIME_BETWEEN_DBLP_REQUESTS } from '@/constants/fetch'
import LastDblpFetch, { LastDblpFetchSchema } from '@/db/models/LastDblpFetch'
import connectDb from '@/db/mongodb'
import { delay } from '@/utils/promises'

/**
 * Waits for a certain amount of time before another request can be sent to dblp.org.
 * The waiting time is stored in the WAITING_TIME_BETWEEN_DBLP_REQUESTS constant.
 * 
 * This is needed because dblp.org recommends waiting one second between requests: https://dblp.org/faq/1474706.html
 * @param signal Abort signal of the incoming request
 */
export default async function waitForNextFetch(signal: AbortSignal) {
    await connectDb();

    const res = await LastDblpFetch.find<LastDblpFetchSchema>({}).sort({ lastFetchAt: 'desc' }).limit(1);
    const nowTime = new Date().getTime();
    const { newTime, oldRecordId } = getNewTime(nowTime, res);

    // Create a new fetch record in the database with the expected time of the fetch call
    const fetch = new LastDblpFetch({
        lastFetchAt: new Date(newTime)
    });
    await fetch.save();

    const abortListener = async () => {
        // If the incoming request is aborted, delete the fetch record in the database  
        await LastDblpFetch.findByIdAndDelete(fetch._id);
    };
    signal.addEventListener('abort', abortListener);

    const waitFor = newTime - new Date().getTime();
    if (waitFor > 0) {
        await delay(waitFor);
    }

    if (oldRecordId) {
        // Delete the previous fetch record in the database
        // so that the records do not accumulate in the database
        await LastDblpFetch.findByIdAndDelete(oldRecordId);
    }

    signal.removeEventListener('abort', abortListener);
}

function getNewTime(nowTime: number, res: Array<LastDblpFetchSchema>) {
    if (res.length > 0) {
        const lastDblpFetch = res[0] as LastDblpFetchSchema;
        const lastFetchTime = lastDblpFetch.lastFetchAt.getTime();
        return {
            newTime: (nowTime - lastFetchTime) > WAITING_TIME_BETWEEN_DBLP_REQUESTS ? nowTime : lastFetchTime + WAITING_TIME_BETWEEN_DBLP_REQUESTS,
            oldRecordId: lastDblpFetch._id
        };
    }

    return { newTime: nowTime, oldRecordId: undefined };
}