import 'server-only'
import DblpAuthorCache, { DblpAuthorCacheSchema } from '@/db/models/DblpAuthorCache'
import connectDb from '@/db/mongodb'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { CACHED_AUTHOR_MAX_AGE } from '@/constants/cache';

export async function cacheAuthor(authorId: string, author: DblpAuthor) {
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
        const newUser = await DblpAuthorCache.create<DblpAuthorCacheSchema>(
            {
                authorId: authorId,
                jsonObject: JSON.stringify(author)
            });
    }
}

export async function tryGetCachedAuthor(authorId: string) {
    await connectDb();

    const cachedAuthor = await DblpAuthorCache.findOne<DblpAuthorCacheSchema>({ authorId: authorId });

    if (cachedAuthor && cachedAuthor.updatedAt >= new Date(new Date().getDate() - CACHED_AUTHOR_MAX_AGE)) {
        return JSON.parse(cachedAuthor.jsonObject) as DblpAuthor
    }

    return null
}