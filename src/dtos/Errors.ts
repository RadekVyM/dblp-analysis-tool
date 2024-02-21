import { ErrorType } from '@/enums/ErrorType'

/** Default custom error that can be thrown. */
export type DefaultError = {
    message: string,
    type: ErrorType,
}

/** Custom error that can be thrown during a fetch call. */
export type FetchError = {
    status: number,
    statusText: string,
    url?: string,
    retryAfter?: number
} & DefaultError