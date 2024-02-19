import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Session } from '@/dtos/Session';

/** Inspired by: https://github.com/balazsorban44/auth-poc-next/tree/main */

const SESSION_SECRET = process.env.SESSION_SECRET!;

if (!SESSION_SECRET) {
    throw new Error('The SESSION_SECRET environment variable is not defined');
}

const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 1 week
const ALGORITHM = 'HS256';
const SESSION_KEY = 'session';
const encryptKey = new TextEncoder().encode(SESSION_SECRET);

/**
 * Updates the user's session.
 * @param username New username
 * @param email New email
 */
export async function updateSession(username: string, email: string) {
    const session = createSession(username, email);
    const encrypted = await encrypt(session);
    cookies().set(SESSION_KEY, encrypted, { expires: session.expires, httpOnly: true });
}

/**
 * Returns the current user's session or null.
 * @returns Session or null if does not exist
 */
export async function getSession(): Promise<Session | null> {
    const session = cookies().get(SESSION_KEY)?.value;
    if (!session) {
        return null;
    }
    return await decrypt(session);
}

/**
 * Deletes the current user's session.
 */
export function destroySession() {
    cookies().set(SESSION_KEY, '', { expires: new Date(0) });
}

/**
 * Updates the expiration date in the current user's session.
 * @param request Request to the server
 * @returns Response
 */
export async function refreshSession(request: NextRequest) {
    const session = request.cookies.get(SESSION_KEY)?.value;
    if (!session) {
        return;
    }

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + EXPIRATION_TIME);
    const res = NextResponse.next();
    res.cookies.set({
        name: SESSION_KEY,
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}

function createSession(username: string, email: string): Session {
    const user = { username, email };
    const expires = new Date(Date.now() + EXPIRATION_TIME);
    return { user, expires };
}

async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: ALGORITHM })
        .setIssuedAt()
        .setExpirationTime('1 week from now')
        .sign(encryptKey);
}

async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, encryptKey, { algorithms: [ALGORITHM] });
    return payload;
}