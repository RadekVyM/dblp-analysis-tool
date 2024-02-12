import { deleteItemRequest } from '../../../shared'
import { removeSavedVenue } from '@/services/saves/venues'

export async function DELETE(request: Request, { params }: { params: { venueId: string } }) {
    return await deleteItemRequest(removeSavedVenue, params.venueId, 'Saved venue could not be removed.')
}