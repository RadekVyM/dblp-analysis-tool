import 'server-only'
import mongoose from 'mongoose'
import { TimestampsDocument } from './TimestampsDocument'

const visitedVenueSchema = new mongoose.Schema<VisitedVenueSchema>({
    visitsCount: { type: Number, required: true },
    venueId: { type: String, required: true },
    name: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.VisitedVenue || mongoose.model<VisitedVenueSchema>('VisitedVenue', visitedVenueSchema);

/** A venue that user visited and can be saved for easier access. */
export type VisitedVenueSchema = {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    name: string,
    venueId: string,
    visitsCount: number
} & TimestampsDocument