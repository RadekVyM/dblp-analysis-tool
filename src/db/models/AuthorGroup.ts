import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const groupAuthorSchema = new mongoose.Schema<GroupAuthorSchema>({
    authorId: { type: String, required: true },
    name: { type: String, required: true },
}, { timestamps: true });

const authorGroupSchema = new mongoose.Schema<AuthorGroupSchema>({
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    authors: { type: [groupAuthorSchema] }
}, { timestamps: true });

export default mongoose.models.AuthorGroup || mongoose.model<AuthorGroupSchema>('AuthorGroup', authorGroupSchema);

export type GroupAuthorSchema = {
    name: string,
    authorId: string
} & TimestampsDocument

export type AuthorGroupSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: string,
    authors: Array<GroupAuthorSchema>
} & TimestampsDocument