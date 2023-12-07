import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const dblpAuthorSchema = new mongoose.Schema<DblpAuthorCacheSchema>({
    authorId: { type: String, required: true },
    jsonObject: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.DblpAuthorCache || mongoose.model<DblpAuthorCacheSchema>('DblpAuthorCache', dblpAuthorSchema);

export type DblpAuthorCacheSchema = {
    authorId: string,
    jsonObject: string
} & TimestampsDocument