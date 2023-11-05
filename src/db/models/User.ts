import 'server-only'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema<UserSchema>({
    email: { type: String, required: true, unique: true, dropDups: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, maxLength: 100 },
});

export default mongoose.models.User || mongoose.model<UserSchema>('User', userSchema);

export type UserSchema = {
    email: string,
    passwordHash: string,
    username: string
} & mongoose.Document