export const ErrorType = {
    Default: 'Default',
    Fetch: 'Fetch'
} as const

export type ErrorType = keyof typeof ErrorType
