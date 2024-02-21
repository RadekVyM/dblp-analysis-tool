import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const cachedJsonRecordSchema = new mongoose.Schema<CachedJsonRecordSchema>({
    recordId: { type: String, required: true },
    jsonObject: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.CachedJsonRecord || mongoose.model<CachedJsonRecordSchema>('CachedJsonRecord', cachedJsonRecordSchema);

/** Cached JSON string. */
export type CachedJsonRecordSchema = {
    recordId: string,
    jsonObject: string
} & TimestampsDocument