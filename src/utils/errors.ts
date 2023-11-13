import { FetchError } from '@/dtos/FetchError'

export function unauthorized(message?: string) {
    return new FetchError(message || 'You are not authorized to access this content.', {
        status: 401,
        statusText: 'Unauthorized'
    });
}