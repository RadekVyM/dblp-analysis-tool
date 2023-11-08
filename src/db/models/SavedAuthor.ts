import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const savedAuthorSchema = new mongoose.Schema<SavedAuthorSchema>({
    authorId: { type: String, required: true, unique: true, dropDups: true },
    name: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.SavedAuthor || mongoose.model<SavedAuthorSchema>('SavedAuthor', savedAuthorSchema);

export type SavedAuthorSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    name: string,
    authorId: string
} & TimestampsDocument