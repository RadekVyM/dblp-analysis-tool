import { NextResponse } from 'next/server'
import { noUser } from '../../shared'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { removeSavedAuthor } from '@/services/saves/authors';

export async function DELETE(request: Request, { params }: { params: { authorId: string } }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        await removeSavedAuthor(params.authorId, user);

        return new NextResponse(null, { status: 204 })
    }
    catch (error) {
        return new NextResponse('Author could not be removed.', { status: 400 })
    }
}