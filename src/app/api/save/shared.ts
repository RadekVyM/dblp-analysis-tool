import { NextResponse } from 'next/server'

export async function noUser() {
    return new NextResponse('No user found.', { status: 401 })
}