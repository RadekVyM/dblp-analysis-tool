import 'server-only'
import SavedVenue, { SavedVenueSchema } from '@/db/models/SavedVenue'
import { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { SavedVenue as SavedVenueDto } from '@/dtos/SavedVenues'

/**
 * Saves a venue for the current user.
 * @param dto Venue
 * @param user Current user
 * @returns Updated venue
 */
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

/**
 * Returns all the saved venues of the current user.
 * @param user Current user
 * @returns List of saved venues
 */
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

/**
 * Removes a specified saved venue from the database.
 * @param venueId Saved venue ID
 * @param user Current user
 */
export async function removeSavedVenue(venueId: string, user: UserSchema): Promise<void> {
    await connectDb();
    const a = await SavedVenue.findOneAndDelete<SavedVenueSchema>({ venueId: venueId, user: user._id });
}