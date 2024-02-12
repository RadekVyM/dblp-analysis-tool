import 'server-only'
import SavedAuthor, { SavedAuthorSchema } from '@/db/models/SavedAuthor'
import { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { SavedAuthor as SavedAuthorDto } from '@/dtos/SavedAuthors'

/**
 * Saves an author for the current user.
 * @param dto Author
 * @param user Current user
 * @returns Updated author
 */
export async function saveAuthor(dto: SavedAuthorDto, user: UserSchema): Promise<SavedAuthorDto> {
    await connectDb();

    let author = await SavedAuthor.findOne<SavedAuthorSchema>({ authorId: dto.id, user: user._id });

    if (author) {
        author = await SavedAuthor.findOneAndUpdate<SavedAuthorSchema>(author._id, {
            name: dto.title,
            authorId: dto.id,
            user: user
        });
    }
    else {
        author = await SavedAuthor.create<SavedAuthorSchema>({
            name: dto.title,
            authorId: dto.id,
            user: user
        });
    }

    return {
        id: author?.authorId || '',
        title: author?.name || ''
    }
}

/**
 * Returns all the saved authors of the current user.
 * @param user Current user
 * @returns List of saved authors
 */
export async function getSavedAuthors(user: UserSchema): Promise<Array<SavedAuthorDto>> {
    await connectDb();

    const authors = await SavedAuthor
        .find<SavedAuthorSchema>({ user: user._id })
        .sort({ createdAt: 'desc' });

    return authors.map((a) => ({
        id: a.authorId,
        title: a.name
    }));
}

/**
 * Removes a specified saved author from the database.
 * @param authorId Saved author ID
 * @param user Current user
 */
export async function removeSavedAuthor(authorId: string, user: UserSchema): Promise<void> {
    await connectDb();
    const a = await SavedAuthor.findOneAndDelete<SavedAuthorSchema>({ authorId: authorId, user: user._id });
}