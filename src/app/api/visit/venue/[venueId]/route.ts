import { removeVisitedVenue } from '@/services/visits/venues'
import { deleteItemRequest } from '../../../shared'

export async function DELETE(request: Request, { params }: { params: { venueId: string } }) {
    return await deleteItemRequest(removeVisitedVenue, params.venueId, 'Visited venue could not be removed.')
}