import 'server-only'
import DblpAuthorCache, { DblpAuthorCacheSchema } from '@/db/models/DblpAuthorCache'
import connectDb from '@/db/mongodb'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { CACHED_AUTHOR_MAX_AGE } from '@/constants/cache'

/**
 * Saves an author to the cache (database).
 * @param authorId Normalized ID of the author
 * @param author Object representing the author
 */
export async function cacheAuthor(authorId: string, author: DblpAuthor): Promise<void> {
    await connectDb();

    const cachedAuthor = await DblpAuthorCache.findOne<DblpAuthorCacheSchema>({ authorId: authorId });

    if (cachedAuthor) {
        await DblpAuthorCache.findByIdAndUpdate<DblpAuthorCacheSchema>(
            cachedAuthor._id,
            {
                authorId: authorId,
                jsonObject: JSON.stringify(author)
            });
    }
    else {
        const newAuthor = await DblpAuthorCache.create<DblpAuthorCacheSchema>(
            {
                authorId: authorId,
                jsonObject: JSON.stringify(author)
            });
    }
}

/**
 * Tries to retreive an author from the cache (database).
 * @param authorId Normalized ID of the author
 * @returns Object representing the author or null if no author was found
 */
export async function tryGetCachedAuthor(authorId: string): Promise<DblpAuthor | null> {
    await connectDb();

    const cachedAuthor = await DblpAuthorCache.findOne<DblpAuthorCacheSchema>({ authorId: authorId });

    if (cachedAuthor && cachedAuthor.updatedAt >= new Date(new Date().getDate() - CACHED_AUTHOR_MAX_AGE)) {
        return JSON.parse(cachedAuthor.jsonObject) as DblpAuthor;
    }

    return null;
}