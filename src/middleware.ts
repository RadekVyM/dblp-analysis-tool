import { NextRequest } from 'next/server'
import { refreshSession } from './services/auth/session'

/** Session is refreshed everytime a user makes a request. */
export async function middleware(request: NextRequest) {
    return await refreshSession(request);
}