import { deleteItem } from '../../../shared'
import { removeSavedAuthor } from '@/services/saves/authors'

export async function DELETE(request: Request, { params }: { params: { authorId: string } }) {
    return await deleteItem(removeSavedAuthor, params.authorId, 'Saved author could not be removed.')
}