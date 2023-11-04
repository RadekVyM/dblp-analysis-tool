import User, { Users } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { isNullOrWhiteSpace } from '@/utils/strings'
import bcrypt from 'bcrypt'
import 'server-only'

const SALT_ROUNDS = 10;

export async function signUp(email: string, username: string, password: string, confirmPassword: string) : Promise<Users> {
    // TODO: server-side validation
    
    await connectDb();

    const user = await User.findOne({ email: email });

    if (user) {
        throw new Error('User with this e-mail already exists.');
    }
    if (isNullOrWhiteSpace(password)) {
        throw new Error('Password cannot be empty.');
    }
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
        email: email,
        username: username,
        passwordHash: passwordHash
    });
    const result = await newUser.save();

    return result
}