import 'server-only'
import mongoose from 'mongoose'

export type TimestampsDocument = {
    createdAt: Date,
    updatedAt: Date
} & mongoose.Document