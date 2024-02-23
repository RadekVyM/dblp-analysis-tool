import { tryGetCachedVenueOrVolume } from '@/services/cache/venues'
import { fetchVenueOrVolume } from '@/services/venues/fetch-server'
import waitForNextFetch from '@/services/waitForNextFetch'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { venueId: string, volumeId: string } }) {
    try {
        const cachedVenue = await tryGetCachedVenueOrVolume(params.venueId, params.volumeId);

        if (cachedVenue) {
            return NextResponse.json(cachedVenue);
        }

        await waitForNextFetch(request.signal);

        const venue = await fetchVenueOrVolume(params.venueId, params.volumeId);
        return NextResponse.json(venue);
    }
    catch (error) {
        return new NextResponse('Something went wrong while retrieving the volume.', { status: 400 });
    }
}