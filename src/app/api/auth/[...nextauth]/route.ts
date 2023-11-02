import 'server-only'
import NextAuth from 'next-auth/next'
import { authOptions } from '@/services/auth/authOptions';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST}