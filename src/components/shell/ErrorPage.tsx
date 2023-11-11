'use client'

export type ErrorParams = {
    error: Error,
    reset: () => void
}

type ErrorPageParams = {
    params: ErrorParams
}

export default function ErrorPage({ params: { error, reset } }: ErrorPageParams) {
    return (
        <main
            className='grid place-content-center'>
            {error.cause as string || error.message}
        </main>
    )
}