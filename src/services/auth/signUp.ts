'use server'

import User, { Users } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import bcrypt from 'bcrypt'
import 'server-only'

const SALT_ROUNDS = 10;

export async function signUp(email: string, username: string, password: string) : Promise<Users> {
    await connectDb();

    const user = await User.findOne({ email: email });

    if (user) {
        throw new Error('User with this e-mail already exists');
    }

    const passwordHash = bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
        email: email,
        username: username,
        passwordHash: passwordHash
    });
    const result = await newUser.save();

    return result
}