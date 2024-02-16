import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const visitedAuthorSchema = new mongoose.Schema<VisitedAuthorSchema>({
    visitsCount: { type: Number, required: true },
    authorId: { type: String, required: true },
    name: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.VisitedAuthor || mongoose.model<VisitedAuthorSchema>('VisitedAuthor', visitedAuthorSchema);

/** An author that user visited and can be saved for easier access. */
export type VisitedAuthorSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    name: string,
    authorId: string,
    visitsCount: number
} & TimestampsDocument