import { deleteItem } from '../../../shared'
import { removeSavedVenue } from '@/services/saves/venues'

export async function DELETE(request: Request, { params }: { params: { venueId: string } }) {
    return await deleteItem(removeSavedVenue, params.venueId, 'Saved venue could not be removed.')
}