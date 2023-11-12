'use client'

import { FetchError } from '@/dtos/FetchError'
import PageContainer from './PageContainer'
import PageTitle from './PageTitle'
import Button from '../Button'
import { MdAutorenew } from 'react-icons/md'

export type ErrorParams = {
    error: Error,
    reset: () => void
}

type ErrorPageParams = {
    params: ErrorParams
}

type FetchErrorContentParams = {
    error: FetchError,
    reset: () => void
}

type TypeErrorContentParams = {
    error: TypeError,
    reset: () => void
}

type DefaultErrorContentParams = {
    error: Error,
    reset: () => void
}

type ErrorPageTitleParams = {
    title: string
}

type TryAgainButtonParams = {
    reset: () => void
}

export default function ErrorPage({ params: { error, reset } }: ErrorPageParams) {
    return (
        <PageContainer>
            {
                (error instanceof FetchError) ?
                    <FetchErrorContent
                        error={error}
                        reset={reset} /> :
                    (error instanceof TypeError) ?
                        <TypeErrorContent
                            error={error}
                            reset={reset} /> :
                        <DefaultErrorContent
                            error={error}
                            reset={reset} />
            }
        </PageContainer>
    )
}

function FetchErrorContent({ error, reset }: FetchErrorContentParams) {
    function title(e: FetchError) {
        switch (e.status) {
            case 401:
                return 'Not authorized'
            case 404:
                return 'Oops, 404 Error! That page cannot be found'
            case 408:
                return 'Request timeout'
            case 429:
                return 'Too many requests'
            default:
                return 'Content could not be loaded'
        }
    }

    function message(e: FetchError) {
        switch (e.status) {
            case 401:
                return <p>You are not authorized to do this action. Try to sign in.</p>
            case 404:
                return <p>It looks like nothing was found at this location.</p>
            case 408:
                return <p>Data request took too long. The data service may not be available right now. Please try again later.</p>
            case 429:
                return <p>You have send too many requests. Please try again {e.retryAfter ? `after ${e.retryAfter} seconds` : 'later'}.</p>
            default:
                return <p>Content could not be loaded. Please try again later.</p>
        }
    }

    return (
        <>
            <ErrorPageTitle
                title={title(error)} />

            {message(error)}

            <TryAgainButton
                reset={reset} />
        </>
    )
}

function TypeErrorContent({ error, reset }: TypeErrorContentParams) {
    return (
        <>
            <ErrorPageTitle
                title='Something went wrong on the server' />

            <p>Something went wrong on the server. Please try again later.</p>

            <TryAgainButton
                reset={reset} />
        </>
    )
}

function DefaultErrorContent({ error, reset }: DefaultErrorContentParams) {
    return (
        <>
            <ErrorPageTitle
                title='Content could not be loaded' />

            <p>Content could not be loaded. Please try again later.</p>

            <TryAgainButton
                reset={reset} />
        </>
    )
}

function ErrorPageTitle({ title }: ErrorPageTitleParams) {
    return (
        <PageTitle
            className='mb-2'
            subtitle='error'
            title={title} />
    )
}

function TryAgainButton({ reset }: TryAgainButtonParams) {
    return (
        <Button
            onClick={reset}
            className='self-start my-6 gap-2'
            variant='outline'>
            <MdAutorenew
                className='w-4 h-4' />
            Let&apos;s try again
        </Button>
    )
}