import 'server-only'
import AuthorGroup, { AuthorGroupSchema } from '@/db/models/AuthorGroup'
import { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { AuthorGroup as AuthorGroupDto } from '@/dtos/saves/AuthorGroup'
import { SavedAuthor as SavedAuthorDto } from '@/dtos/saves/SavedAuthor'
import { objectId } from '@/utils/db'

/**
 * Creates or updates an author group for the current user.
 * @param dto Author group
 * @param user Current user
 * @returns Updated author group
 */
export async function saveAuthorGroup(
    dto: AuthorGroupDto & { id: string | undefined },
    user: UserSchema
): Promise<AuthorGroupDto> {
    await connectDb();

    let authorGroup = dto.id ?
        await AuthorGroup.findOne<AuthorGroupSchema>({ _id: objectId(dto.id), user: user._id }) :
        null;

    if (authorGroup) {
        authorGroup = await AuthorGroup.findOneAndUpdate<AuthorGroupSchema>(authorGroup._id, {
            title: dto.title,
            user: user
        });
    }
    else {
        authorGroup = await AuthorGroup.create<AuthorGroupSchema>({
            title: dto.title,
            user: user,
            authors: []
        });
    }

    return authorGroupToDto(authorGroup);
}

/**
 * Returns all the author groups of the current user.
 * @param user Current user
 * @returns List of author groups
 */
export async function getAuthorGroups(user: UserSchema): Promise<Array<AuthorGroupDto>> {
    await connectDb();

    const authorGroups = await AuthorGroup
        .find<AuthorGroupSchema>({ user: user._id })
        .sort({ createdAt: 'desc' });

    return authorGroups.map((ag) => authorGroupToDto(ag));
}

/**
 * Returns an author group with the specified ID.
 * @param authorGroupId Author group ID
 * @param user Current user
 * @returns Author group object or null if no group was found
 */
export async function getAuthorGroup(authorGroupId: string, user: UserSchema): Promise<AuthorGroupDto | null> {
    await connectDb();

    const authorGroup = await AuthorGroup.findOne<AuthorGroupSchema>({ _id: objectId(authorGroupId), user: user._id });

    return authorGroup ? authorGroupToDto(authorGroup) : null;
}

/**
 * Removes a specified author group from the database.
 * @param authorGroupId Author group ID
 * @param user Current user
 */
export async function removeAuthorGroup(authorGroupId: string, user: UserSchema): Promise<void> {
    await connectDb();
    await AuthorGroup.findOneAndDelete<AuthorGroupSchema>({ _id: objectId(authorGroupId), user: user._id });
}

/**
 * Adds authors to a specified author group.
 * @param authors List of authors
 * @param authorGroupId Author group ID
 * @param user Current user
 * @returns Updated author group
 */
export async function addAuthorsToAuthorGroup(authors: Array<SavedAuthorDto>, authorGroupId: string, user: UserSchema): Promise<AuthorGroupDto> {
    await connectDb();

    let authorGroup = await AuthorGroup.findOne<AuthorGroupSchema>({ _id: objectId(authorGroupId), user: user._id });

    if (authorGroup) {
        const oldAuthors = authorGroup.authors
            .filter((a) => !authors.find((aa) => a.authorId == aa.id))

        authorGroup = await AuthorGroup.findOneAndUpdate<AuthorGroupSchema>(authorGroup._id, {
            authors: [...(authors.map((a) => ({ authorId: a.id, name: a.title }))), ...oldAuthors]
        });
    }

    return authorGroupToDto(authorGroup);
}

/**
 * Removes authors from a specified author group.
 * @param authorIds List of author IDs
 * @param authorGroupId Author group ID
 * @param user Current user
 * @returns Updated author group
 */
export async function removeAuthorsFromAuthorGroup(authorIds: Array<string>, authorGroupId: string, user: UserSchema): Promise<AuthorGroupDto> {
    await connectDb();

    let authorGroup = await AuthorGroup.findOne<AuthorGroupSchema>({ _id: objectId(authorGroupId), user: user._id });

    if (authorGroup) {
        const newAuthors = authorGroup.authors
            .filter((a) => !authorIds.find((id) => a.authorId == id));

        authorGroup = await AuthorGroup.findOneAndUpdate<AuthorGroupSchema>(authorGroup._id, {
            authors: newAuthors
        });
    }

    return authorGroupToDto(authorGroup);
}

/** Converts an author group database object to a DTO. */
function authorGroupToDto(authorGroup: AuthorGroupSchema | null) {
    return {
        id: authorGroup?._id.toString() || '',
        title: authorGroup?.title || '',
        authors: authorGroup?.authors.map((a) => ({
            title: a.name,
            id: a.authorId
        })) || []
    };
}