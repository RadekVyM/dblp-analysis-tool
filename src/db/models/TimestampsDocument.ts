import 'server-only'
import mongoose from 'mongoose'

/** MongoDB document that contains timestamps. */
export type TimestampsDocument = {
    createdAt: Date,
    updatedAt: Date
} & mongoose.Document