import { UserSchema } from '@/db/models/User'
import { SavedAuthor } from '@/dtos/saves/SavedAuthor'
import { SavedVenue } from '@/dtos/saves/SavedVenue'
import { getCurrentUser } from '@/services/auth/server'
import { NextResponse } from 'next/server'

/**
 * Returns an error NextResponse for situation when no user is found.
 */
export async function noUser() {
    return new NextResponse('No user found.', { status: 401 });
}

/**
 * Returns an author DTO from the request body or an error NextResponse when the DTO is not in the correct format.
 */
export async function authorDto(request: Request) {
    const dto = await request.json() as SavedAuthor;

    // TODO: Validation using Zod?
    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 });
    }

    return dto;
}

/**
 * Returns a venue DTO from the request body or an error NextResponse when the DTO is not in the correct format.
 */
export async function venueDto(request: Request) {
    const dto = await request.json() as SavedVenue;

    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 });
    }

    return dto;
}

/**
 * Deletes an item and returns a NextResponse.
 * @param remove Function that removes the item and returns a NextResponse
 * @param id Item ID
 * @param errorMessage Generic error message that is displayed when an error occures
 */
export async function deleteItemRequest(
    remove: (id: string, user: UserSchema) => Promise<void>,
    id: string,
    errorMessage: string
) {
    return await authorizedRequest(
        async (user) => {
            await remove(id, user);
            return new NextResponse(null, { status: 204 })
        },
        errorMessage);
}

/**
 * Executes an action that needs an authorized user.
 * @param action Function that is executed an action and returns a NextResponse
 * @param errorMessage Generic error message that is displayed when an error occures
 */
export async function authorizedRequest(
    action: (user: UserSchema) => Promise<NextResponse>,
    errorMessage: string
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser();
        }

        return await action(user);
    }
    catch (error) {
        return new NextResponse(errorMessage, { status: 400 });
    }
}