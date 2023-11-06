import 'server-only'
import mongoose from 'mongoose'

const groupAuthorSchema = new mongoose.Schema<GroupAuthorSchema>({
    authorId: { type: String, required: true, unique: true, dropDups: true },
    name: { type: String, required: true },
});

const authorGroupSchema = new mongoose.Schema<AuthorGroupSchema>({
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    authors: { type: [groupAuthorSchema] } 
});

export default mongoose.models.AuthorGroup || mongoose.model<AuthorGroupSchema>('AuthorGroup', authorGroupSchema);

export type GroupAuthorSchema = {
    name: string,
    authorId: string
} & mongoose.Document

export type AuthorGroupSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: string,
    authors: Array<GroupAuthorSchema>
} & mongoose.Document