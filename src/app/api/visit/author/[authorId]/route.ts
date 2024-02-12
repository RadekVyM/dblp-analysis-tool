import { deleteItemRequest } from '../../../shared'
import { removeVisitedAuthor } from '@/services/visits/authors'

export async function DELETE(request: Request, { params }: { params: { authorId: string } }) {
    return await deleteItemRequest(removeVisitedAuthor, params.authorId, 'Visited author could not be removed.')
}