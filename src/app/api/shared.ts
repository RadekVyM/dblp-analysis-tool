import { UserSchema } from '@/db/models/User'
import { SavedAuthor } from '@/dtos/SavedAuthors'
import { SavedVenue } from '@/dtos/SavedVenues'
import { getCurrentUser } from '@/services/auth'
import { NextResponse } from 'next/server'

export async function noUser() {
    return new NextResponse('No user found.', { status: 401 })
}

export async function authorDto(request: Request) {
    const dto = await request.json() as SavedAuthor;

    // TODO: Validation using Zod?
    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}

export async function venueDto(request: Request) {
    const dto = await request.json() as SavedVenue;

    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}

export async function postAuthor(
    remove: (id: string, user: UserSchema) => Promise<void>,
    id: string,
    errorMessage: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        await remove(id, user);

        return new NextResponse(null, { status: 204 })
    }
    catch (error) {
        return new NextResponse(errorMessage, { status: 400 })
    }
}

export async function deleteItem(
    remove: (id: string, user: UserSchema) => Promise<void>,
    id: string,
    errorMessage: string) {
    return await authorizedRequest(async (user) => {
        await remove(id, user);
        return new NextResponse(null, { status: 204 })
    },
        errorMessage)
}

export async function authorizedRequest(
    action: (user: UserSchema) => Promise<NextResponse>,
    errorMessage: string
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        return await action(user);
    }
    catch (error) {
        return new NextResponse(errorMessage, { status: 400 })
    }
}