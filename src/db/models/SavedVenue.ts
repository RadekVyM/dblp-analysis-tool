import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const savedVenueSchema = new mongoose.Schema<SavedVenueSchema>({
    venueId: { type: String, required: true },
    title: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.SavedVenue || mongoose.model<SavedVenueSchema>('SavedVenue', savedVenueSchema);

export type SavedVenueSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: string,
    venueId: string
} & TimestampsDocument