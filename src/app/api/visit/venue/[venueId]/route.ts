import { removeVisitedVenue } from '@/services/visits/venues'
import { deleteItem } from '../../../shared'

export async function DELETE(request: Request, { params }: { params: { venueId: string } }) {
    return await deleteItem(removeVisitedVenue, params.venueId, 'Visited venue could not be removed.')
}