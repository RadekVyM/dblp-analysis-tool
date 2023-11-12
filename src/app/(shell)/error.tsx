'use client'

import ErrorPage, { ErrorParams } from '@/components/shell/ErrorPage'

export default function Error(params: ErrorParams) {
    return (
        <ErrorPage params={params} />
    )
}