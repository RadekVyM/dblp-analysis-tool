import getCurrentUser from '@/services/auth/getCurrentUser'
import { NextResponse } from 'next/server'
import { noUser } from '../shared'
import { SavedVenue } from '@/dtos/SavedVenues'
import { getSavedVenues, saveVenue } from '@/services/saves/venues'

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        const venues = await getSavedVenues(user);
        return NextResponse.json(venues)
    }
    catch (e) {
        return new NextResponse('Saved venues could not be fetched.', { status: 400 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }
        
        const dto = await venueDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const venue = await saveVenue(dto, user);
        return NextResponse.json(venue)
    }
    catch (error) {
        return new NextResponse('Venue could not be saved.', { status: 400 })
    }
}

async function venueDto(request: Request) {
    const dto = await request.json() as SavedVenue;

    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}