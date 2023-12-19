import 'server-only'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthOptions } from 'next-auth'
import { isNullOrWhiteSpace } from '@/utils/strings'
import connectDb from '@/db/mongodb'
import User, { UserSchema } from '@/db/models/User'
import bcrypt from 'bcrypt'
import signInValidator from '@/validation/signInValidator'
import { anyKeys } from '@/utils/objects'
import { error, unauthorizedError } from '@/utils/errors'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                if(isNullOrWhiteSpace(credentials?.email) || isNullOrWhiteSpace(credentials?.password) || !credentials) {
                    throw unauthorizedError('Please enter an e-mail and password.');
                }

                const err = signInValidator({ email: credentials?.email || '', password: credentials?.password || '' });

                if (anyKeys(err)) {
                    throw unauthorizedError('The values you entered are not valid.');
                }

                try {
                    return await findMatchingUser(credentials?.email, credentials.password);
                }
                catch (err) {
                    throw unauthorizedError('An account matching the e-mail and password you entered couldn\'t be found. Please check your e-mail and password and try again.');
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    debug: process.env.NODE_ENV === 'development',
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/signin',
        verifyRequest: '/auth/verify-request',
        newUser: '/'
    },
    callbacks: {
        async jwt({ token, trigger, session, user }) {
            if (trigger === 'update' && session) {
                return { ...token, ...session.user }
            }
            
            return { ...token, ...user }
        },
        async session({ session, token, user }) {
            session.user = token;
            return session
        },
    },
};

async function findMatchingUser(email: string, password: string) {
    await connectDb();

    const user = await User.findOne<UserSchema>({ email: email });

    if (!user?.passwordHash) {
        throw unauthorizedError('A user matching the e-mail and password couldn\'t be found.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        throw unauthorizedError('A user matching the e-mail and password couldn\'t be found.');
    }

    return { id: user._id.toString(), name: user.username, username: user.username, email: user.email }
}