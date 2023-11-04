import 'server-only'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthOptions } from 'next-auth'
import { isNullOrWhiteSpace } from '@/utils/strings'
import connectDb from '@/db/mongodb'
import User, { Users } from '@/db/models/User'
import bcrypt from 'bcrypt'

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
                    throw new Error('Please enter an e-mail and password.');
                }

                try {
                    return await findMatchingUser(credentials?.email, credentials.password);
                }
                catch (error) {
                    throw new Error('An account matching the e-mail and password you entered couldn\'t be found. Please check your e-mail and password and try again.');
                }
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

async function findMatchingUser(email: string, password: string) {
    await connectDb();

    const user = await User.findOne<Users>({ email: email });

    if (!user?.passwordHash) {
        throw new Error('A user matching the e-mail and password couldn\'t be found.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        throw new Error('A user matching the e-mail and password couldn\'t be found.');
    }

    return { id: user._id.toString(), name: user.username, username: user.username, email: user.email }
}