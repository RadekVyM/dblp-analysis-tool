import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { venueId: string, volumeId: string } }) {
    try {
        // TODO: Try to make sure that a request is not called more than once a second
        const volume = await fetchVenueOrVolume(params.venueId, params.volumeId);
        return NextResponse.json(volume);
    }
    catch (error) {
        return new NextResponse('Something went wrong while retrieving the volume.', { status: 400 });
    }
}