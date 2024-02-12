import { NextResponse } from 'next/server'
import { venueDto, authorizedRequest } from '../../shared'
import { getVisitedVenues, updateVisitedVenue } from '@/services/visits/venues'
import { DISPLAYED_VISITED_AUTHORS_COUNT } from '@/constants/visits'

export async function GET(request: Request) {
    return await authorizedRequest(async (user) => {
        const venues = await getVisitedVenues(user, DISPLAYED_VISITED_AUTHORS_COUNT);
        return NextResponse.json(venues)
    },
    'Visited venues could not be fetched.')
}

export async function POST(request: Request) {
    return await authorizedRequest(async (user) => {
        const dto = await venueDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const venue = await updateVisitedVenue(dto, user);
        return NextResponse.json(venue)
    },
    'Visited venue could not be saved.')
}