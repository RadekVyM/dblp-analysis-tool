import mongoose from 'mongoose'
import 'server-only'

/**
 * Converts the string MongoDB ID to ObjectId.
 * @param id String MongoDB ID.
 * @returns ObjectId
 */
export function objectId(id: string) {
    return new mongoose.Types.ObjectId(id);
}