import { DefaultError, FetchError } from '@/dtos/Errors'
import { ErrorType } from '@/enums/ErrorType'

/**
 * Returns an unauthorized error (401).
 * @param message Error message
 * @returns Unauthorized error
 */
export function unauthorizedError(message?: string): Error {
    return fetchError(message || 'You are not authorized to access this content.', 401, 'Unauthorized');
}

/**
 * Returns a bad request error (400).
 * @param message Error message
 * @returns Bad request error
 */
export function badRequestError(message?: string): Error {
    return fetchError(message || 'Bad Request', 400, 'Bad Request');
}

/**
 * Returns an internal server error (500).
 * @param message Error message
 * @returns Internal server error
 */
export function serverError(message?: string): Error {
    return fetchError(message || 'Internal Server Error', 500, 'Internal Server Error');
}

/**
 * Returns an instance of Error with a serialized fetch error object in the message property.
 * @param message Error message
 * @param status Status code
 * @param statusText Status code message
 * @param options Additional info
 * @returns Instance of Error with a serialized fetch error object in the message property
 */
export function fetchError(message: string, status: number, statusText: string, url?: string, options?: object): Error {
    return error({
        ...options,
        message: message,
        type: ErrorType.Fetch,
        status: status,
        statusText: statusText,
        url: url
    } as FetchError);
}

/**
 * Returns an instance of Error with a serialized error object in the message property.
 * @param message Text or error object
 * @returns Instance of Error with a serialized error object in the message property
 */
export function error(message: string | { message: string, type: ErrorType, [key: string]: any }): Error {
    const errorObject: DefaultError = typeof message === 'string' ?
        { message, type: ErrorType.Default } :
        message;
    return new Error(JSON.stringify(errorObject));
}

/**
 * Returns deserialized error object from the Error message, if the message is valid, otherwise null.
 * @param error Error instance or its message
 * @returns Deserialized error object or null
 */
export function unpackDefaultError(error: Error | string): DefaultError | null {
    try {
        const errorObject = JSON.parse(typeof error === 'string' ? error : error.message);

        if ('message' in errorObject && 'type' in errorObject) {
            return errorObject as DefaultError;
        }
        else {
            return null;
        }
    }
    catch (e) {
        return null;
    }
}

/**
 * If the error object is a fetch error object, returns it, otherwise returns null.
 * @param error Error instance or its message
 * @returns Fetch error object or null
 */
export function unpackFetchError(error: DefaultError): FetchError | null {
    if ('status' in error) {
        return error as FetchError;
    }
    else {
        return null;
    }
}