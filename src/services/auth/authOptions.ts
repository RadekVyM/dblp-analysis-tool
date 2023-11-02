import 'server-only'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthOptions } from 'next-auth'
import bcrypt from 'bcrypt'
import User from '@/db/models/User'
import connectDb from '@/db/mongodb'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                if(!credentials || !credentials.email || !credentials.password) {
                    throw new Error('Please enter an email and password');
                }

                await connectDb();

                const user = await User.findOne({ email: credentials.email });

                if (!user || !user?.passwordHash) {
                    throw new Error('No user found');
                }

                // check to see if password matches
                const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

                // if password does not match
                if (!passwordMatch) {
                    throw new Error('Incorrect password');
                }

                return { id: user._id.toString(), username: user.username, email: user.email }
            },
        }),  
    ],
    secret: process.env.SECRET,
    debug: process.env.NODE_ENV === 'development',
};