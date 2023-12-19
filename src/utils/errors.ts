import { DefaultError, FetchError } from '@/dtos/Errors'
import { ErrorType } from '@/enums/ErrorType'

/**
 * Returns an unauthorized error.
 * @param message Error message.
 * @returns Unauthorized error.
 */
export function unauthorizedError(message?: string): Error {
    return fetchError(message || 'You are not authorized to access this content.', 401, 'Unauthorized')
}

export function badRequestError(message?: string): Error {
    return fetchError(message || 'Bad Request', 400, 'Bad Request')
}

export function serverError(message?: string): Error {
    return fetchError(message || 'Internal Server Error', 500, 'Internal Server Error')
}

export function fetchError(message: string, status: number, statusText: string, options?: object): Error {
    return error({
        ...options,
        message: message,
        type: ErrorType.Fetch,
        status: status,
        statusText: statusText
    } as DefaultError)
}

export function error(message: string | { message: string, type: ErrorType, [key: string]: any }): Error {
    const errorObject: DefaultError = typeof message === 'string' ?
        { message, type: ErrorType.Default } :
        message;
    return new Error(JSON.stringify(errorObject))
}

export function unpackDefaultError(error: Error | string): DefaultError | null {
    try {
        const errorObject = JSON.parse(typeof error === 'string' ? error : error.message);

        if ('message' in errorObject && 'type' in errorObject) {
            return errorObject as DefaultError
        }
        else {
            return null
        }
    }
    catch (e) {
        return null
    }
}

export function unpackFetchError(error: DefaultError): FetchError | null {
    if ('status' in error) {
        return error as FetchError
    }
    else {
        return null
    }
}