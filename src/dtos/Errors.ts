import { ErrorType } from '@/enums/ErrorType'

export type DefaultError = {
    message: string,
    type: ErrorType,
}

export type FetchError = {
    status: number,
    statusText: string,
    retryAfter?: number
} & DefaultError