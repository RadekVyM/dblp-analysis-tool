'use client'

// @ts-expect-error
import { useFormStatus } from 'react-dom'
import Button, { ButtonParams } from '../Button'

type SubmitButtonParams = {
    loading?: boolean
} & ButtonParams

/** Submit button of a form. */
export default function SubmitButton({ loading, disabled, ...props }: SubmitButtonParams) {
    const { pending } = useFormStatus();

    return (
        <Button
            {...props}
            type='submit'
            disabled={disabled || pending || loading} />
    )
}