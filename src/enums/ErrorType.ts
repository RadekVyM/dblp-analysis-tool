/** Type of a custom error that can be thrown. */
export const ErrorType = {
    Default: 'Default',
    Fetch: 'Fetch'
} as const;

/** Type of a custom error that can be thrown. */
export type ErrorType = keyof typeof ErrorType