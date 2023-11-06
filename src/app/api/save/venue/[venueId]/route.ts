import { NextResponse } from 'next/server'
import { noUser } from '../../shared'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { removeSavedVenue } from '@/services/saves/venues'

export async function DELETE(request: Request, { params }: { params: { venueId: string } }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        await removeSavedVenue(params.venueId, user);

        return new NextResponse(null, { status: 204 })
    }
    catch (error) {
        return new NextResponse('Saved venue could not be removed.', { status: 400 })
    }
}