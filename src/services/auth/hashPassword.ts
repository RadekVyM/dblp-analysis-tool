import bcrypt from 'bcrypt'
import 'server-only'

const SALT_ROUNDS = 10;

export default async function hashPassword(password: string) {
    return await bcrypt.hash(password, SALT_ROUNDS)
}