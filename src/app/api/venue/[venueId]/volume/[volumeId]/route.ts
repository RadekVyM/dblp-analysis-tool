import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import { NextRequest, NextResponse } from 'next/server'

/** Endpoint for loading a venue or venue volume information. */
export async function GET(request: NextRequest, { params }: { params: { venueId: string, volumeId: string } }) {
    try {
        const venue = await fetchVenueOrVolume(params.venueId, params.volumeId, request.signal);
        return NextResponse.json(venue);
    }
    catch (error) {
        return new NextResponse('Something went wrong while retrieving the volume.', { status: 400 });
    }
}