'use client'

import { DefaultError, FetchError } from '@/dtos/Errors'
import PageContainer from './PageContainer'
import PageTitle from './PageTitle'
import Button from '../Button'
import { MdAutorenew } from 'react-icons/md'
import { unpackDefaultError, unpackFetchError } from '@/utils/errors'

/** Parameters of an error page. */
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

type ErrorObjectContentParams = {
    error: DefaultError,
    reset: () => void
}

type DefaultErrorContentParams = {
    reset: () => void
}

type ErrorPageTitleParams = {
    title: string
}

type TryAgainButtonParams = {
    reset: () => void
}

/** Content that is displayed when there is an unhandled error. */
export default function ErrorPage({ params: { error, reset } }: ErrorPageParams) {
    const errorObject = unpackDefaultError(error);

    return (
        <PageContainer>
            {
                (errorObject) ?
                    <ErrorObjectContent
                        error={errorObject}
                        reset={reset} /> :
                    <DefaultErrorContent
                        reset={reset} />
            }
        </PageContainer>
    )
}

function ErrorObjectContent({ error, reset }: ErrorObjectContentParams) {
    const fetchError = unpackFetchError(error);

    return fetchError ?
        <FetchErrorContent
            error={fetchError}
            reset={reset} /> :
        <DefaultErrorContent
            reset={reset} />
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
                return 'Something went wrong'
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

function DefaultErrorContent({ reset }: DefaultErrorContentParams) {
    return (
        <>
            <ErrorPageTitle
                title='Something went wrong' />

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
            Try again
        </Button>
    )
}