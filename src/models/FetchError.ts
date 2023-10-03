interface FetchErrorOptions extends ErrorOptions {
    status?: number,
    statusText?: string,
    retryAfter?: number
}

export class FetchError extends Error {
    public readonly status?: number
    public readonly statusText?: string
    public readonly retryAfter?: number

    constructor(message?: string, options?: FetchErrorOptions) {
        super(message, options);

        this.status = options?.status
        this.statusText = options?.statusText
    }
}