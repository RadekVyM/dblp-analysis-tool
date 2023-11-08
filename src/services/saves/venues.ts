import SavedVenue, { SavedVenueSchema } from '@/db/models/SavedVenue'
import { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { SavedVenue as SavedVenueDto } from '@/dtos/SavedVenues'
import 'server-only'

export async function saveVenue(dto: SavedVenueDto, user: UserSchema): Promise<SavedVenueDto> {
    await connectDb();

    let venue = await SavedVenue.findOne<SavedVenueSchema>({ venueId: dto.id, user: user._id });

    if (venue) {
        venue = await SavedVenue.findOneAndUpdate<SavedVenueSchema>(venue._id, {
            title: dto.title,
            venueId: dto.id,
            user: user
        });
    }
    else {
        venue = await SavedVenue.create<SavedVenueSchema>({
            title: dto.title,
            venueId: dto.id,
            user: user
        });
    }

    return {
        id: venue?.venueId || '',
        title: venue?.title || ''
    }
}

export async function getSavedVenues(user: UserSchema): Promise<Array<SavedVenueDto>> {
    await connectDb();

    const venues = await SavedVenue
        .find<SavedVenueSchema>({ user: user._id })
        .sort({ createdAt: 'desc' });

    return venues.map((v) => ({
        id: v.venueId,
        title: v.title
    }));
}

export async function removeSavedVenue(venueId: string, user: UserSchema): Promise<void> {
    await connectDb();
    const a = await SavedVenue.findOneAndDelete<SavedVenueSchema>({ venueId: venueId, user: user._id });
}