import mongoose from 'mongoose'
import 'server-only'

export function objectId(id: string) {
    return new mongoose.Types.ObjectId(id)
}