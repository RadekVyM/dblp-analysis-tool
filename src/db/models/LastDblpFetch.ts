import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const lastDblpFetchSchema = new mongoose.Schema<LastDblpFetchSchema>({
    lastFetchAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.LastDblpFetch || mongoose.model<LastDblpFetchSchema>('LastDblpFetch', lastDblpFetchSchema);

/** Cached JSON string. */
export type LastDblpFetchSchema = {
    lastFetchAt: Date,
} & TimestampsDocument