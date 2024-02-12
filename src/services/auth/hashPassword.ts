import 'server-only'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10;

/**
 * Returns a hash of a password.
 * @param password Password as a string
 * @returns Hash of the password
 */
export default async function hashPassword(password: string) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}