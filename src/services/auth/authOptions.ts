import 'server-only'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthOptions } from 'next-auth'
import bcrypt from 'bcrypt'
import User from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { isNullOrWhiteSpace } from '@/utils/strings'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                if(isNullOrWhiteSpace(credentials?.email) || isNullOrWhiteSpace(credentials?.email) || !credentials) {
                    throw new Error('Please enter an email and password');
                }

                await connectDb();

                const user = await User.findOne({ email: credentials.email });

                if (!user?.passwordHash) {
                    throw new Error('No user found');
                }

                const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!passwordMatch) {
                    throw new Error('Incorrect password');
                }

                return { id: user._id.toString(), name: user.username, username: user.username, email: user.email }
            },
        }),  
    ],
    secret: process.env.NEXTAUTH_SECRET,
    /*
    session: {
        strategy: 'jwt',
    },
    */
    debug: process.env.NODE_ENV === 'development',
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/signin',
        verifyRequest: '/auth/verify-request',
        newUser: '/'
    }
};