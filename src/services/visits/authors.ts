import { UserSchema } from '@/db/models/User'
import VisitedAuthor, { VisitedAuthorSchema } from '@/db/models/VisitedAuthor'
import connectDb from '@/db/mongodb'
import { SavedAuthor as SavedAuthorDto, VisitedAuthor as VisitedAuthorDto } from '@/dtos/SavedAuthors'
import 'server-only'

export async function visitedAuthor(dto: SavedAuthorDto, user: UserSchema): Promise<VisitedAuthorDto> {
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
        visitsCount: author?.visitsCount
    }
}

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
        title: a.name
    }));
}

export async function removeVisitedAuthor(authorId: string, user: UserSchema): Promise<void> {
    await connectDb();
    const a = await VisitedAuthor.findOneAndDelete<VisitedAuthorSchema>({ authorId: authorId, user: user._id });
}