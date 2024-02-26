import 'server-only'
import { UserSchema } from '@/db/models/User'
import VisitedAuthor, { VisitedAuthorSchema } from '@/db/models/VisitedAuthor'
import connectDb from '@/db/mongodb'
import { SavedAuthor as SavedAuthorDto } from '@/dtos/saves/SavedAuthor'
import { VisitedAuthor as VisitedAuthorDto } from '@/dtos/saves/VisitedAuthor'

/**
 * Updates a visited author by the current user.
 * @param dto Visited author
 * @param user Current user
 * @returns Visited author
 */
export async function updateVisitedAuthor(dto: SavedAuthorDto, user: UserSchema): Promise<VisitedAuthorDto> {
    await connectDb();

    let author = await VisitedAuthor.findOne<VisitedAuthorSchema>({ authorId: dto.id, user: user._id });

    if (author) {
        author = await VisitedAuthor.findOneAndUpdate<VisitedAuthorSchema>(author._id, {
            name: dto.title,
            authorId: dto.id,
            user: user,
            visitsCount: author.visitsCount + 1
        });
    }
    else {
        author = await VisitedAuthor.create<VisitedAuthorSchema>({
            name: dto.title,
            authorId: dto.id,
            user: user,
            visitsCount: 1
        });
    }

    return {
        id: author?.authorId || '',
        title: author?.name || '',
        visitsCount: author?.visitsCount || 0
    };
}

/**
 * Returns all the visited authors by the current user.
 * @param user Current user
 * @param limit Max number of returned authors
 * @returns List of visited authors
 */
export async function getVisitedAuthors(user: UserSchema, limit?: number): Promise<Array<VisitedAuthorDto>> {
    await connectDb();

    const query = VisitedAuthor
        .find<VisitedAuthorSchema>({ user: user._id })
        .sort({ updatedAt: 'desc' });

    const authors = limit ?
        await query.limit(limit) :
        await query;

    return authors.map((a) => ({
        id: a.authorId,
        title: a.name,
        visitsCount: a.visitsCount
    }));
}

/**
 * Removes a visited author from the database.
 * @param venueId Normalized ID of the author
 * @param user Current user
 */
export async function removeVisitedAuthor(authorId: string, user: UserSchema): Promise<void> {
    await connectDb();
    await VisitedAuthor.findOneAndDelete<VisitedAuthorSchema>({ authorId: authorId, user: user._id });
}