import { NextResponse } from 'next/server'
import { authorizedRequest, venueDto } from '../../shared'
import { getSavedVenues, saveVenue } from '@/services/saves/venues'

export async function GET(request: Request) {
    return await authorizedRequest(
        async (user) => {
            const venues = await getSavedVenues(user);
            return NextResponse.json(venues);
        },
        'Saved venues could not be fetched.')
}

export async function POST(request: Request) {
    return await authorizedRequest(
        async (user) => {
            const dto = await venueDto(request);
            if (dto instanceof NextResponse) {
                return dto
            }

            const venue = await saveVenue(dto, user);
            return NextResponse.json(venue);
        },
        'Venue could not be saved.');
}