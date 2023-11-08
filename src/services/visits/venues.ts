import { UserSchema } from '@/db/models/User'
import VisitedVenue, { VisitedVenueSchema } from '@/db/models/VisitedVenue'
import connectDb from '@/db/mongodb'
import { SavedVenue as SavedVenueDto, VisitedVenue as VisitedVenueDto } from '@/dtos/SavedVenues'
import 'server-only'

export async function visitedVenue(dto: SavedVenueDto, user: UserSchema): Promise<VisitedVenueDto> {
    await connectDb();

    let venue = await VisitedVenue.findOne<VisitedVenueSchema>({ venueId: dto.id, user: user._id });

    if (venue) {
        venue = await VisitedVenue.findOneAndUpdate<VisitedVenueSchema>(venue._id, {
            name: dto.title,
            venueId: dto.id,
            user: user,
            visitsCount: venue.visitsCount + 1
        });
    }
    else {
        venue = await VisitedVenue.create<VisitedVenueSchema>({
            name: dto.title,
            venueId: dto.id,
            user: user,
            visitsCount: 1
        });
    }

    return {
        id: venue?.venueId || '',
        title: venue?.name || '',
        visitsCount: venue?.visitsCount
    }
}

export async function getVisitedVenues(user: UserSchema, limit?: number): Promise<Array<VisitedVenueDto>> {
    await connectDb();

    const query = VisitedVenue
        .find<VisitedVenueSchema>({ user: user._id })
        .sort({ updatedAt: 'desc' });

    const venues = limit ?
        await query.limit(limit) :
        await query;

    return venues.map((v) => ({
        id: v.venueId,
        title: v.name,
        visitsCount: v?.visitsCount
    }));
}

export async function removeVisitedVenue(venueId: string, user: UserSchema): Promise<void> {
    await connectDb();
    const a = await VisitedVenue.findOneAndDelete<VisitedVenueSchema>({ venueId: venueId, user: user._id });
}