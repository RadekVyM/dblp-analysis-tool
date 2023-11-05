import 'server-only'
import mongoose from 'mongoose'

const savedAuthorSchema = new mongoose.Schema<SavedAuthorSchema>({
    title: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User' }
});

export default mongoose.models.SavedAuthor || mongoose.model<SavedAuthorSchema>('SavedAuthor', savedAuthorSchema);

export type SavedAuthorSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: string,
} & mongoose.Document