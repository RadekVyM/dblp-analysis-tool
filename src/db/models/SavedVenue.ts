import 'server-only'
import mongoose from 'mongoose'

const savedVenueSchema = new mongoose.Schema<SavedVenueSchema>({
    venueId: { type: String, required: true, unique: true, dropDups: true },
    title: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.SavedVenue || mongoose.model<SavedVenueSchema>('SavedVenue', savedVenueSchema);

export type SavedVenueSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    title: string,
    venueId: string
} & mongoose.Document