'use client'

export default function Error({ error, reset }: ErrorParams) {
    return (
        <div className='flex-1 grid place-content-center'>
            {error.cause as string || error.message}
        </div>
    )
}