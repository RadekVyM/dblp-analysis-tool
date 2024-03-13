'use client'

import ErrorPage, { ErrorParams } from '@/components/shell/ErrorPage'

/** Error component for the venue search page. */
export default function Error(params: ErrorParams) {
    return (
        <ErrorPage params={params} />
    )
}