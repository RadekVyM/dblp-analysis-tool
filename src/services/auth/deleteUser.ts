import User, { UserSchema } from '@/db/models/User'
import getCurrentUser from './getCurrentUser'
import connectDb from '@/db/mongodb'
import SavedAuthor from '@/db/models/SavedAuthor'
import SavedVenue from '@/db/models/SavedVenue'
import VisitedAuthor from '@/db/models/VisitedAuthor'
import VisitedVenue from '@/db/models/VisitedVenue'
import AuthorGroup from '@/db/models/AuthorGroup'

export default async function deleteCurrentUser() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Current user could not be found.');
    }

    await connectDb();

    await SavedAuthor.deleteMany({ user: user._id });
    await SavedVenue.deleteMany({ user: user._id });
    await VisitedAuthor.deleteMany({ user: user._id });
    await VisitedVenue.deleteMany({ user: user._id });
    await AuthorGroup.deleteMany({ user: user._id });
    await User.findByIdAndDelete<UserSchema>(user._id);
}