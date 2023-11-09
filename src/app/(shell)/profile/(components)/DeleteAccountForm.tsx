'use client'

import SubmitButton from '@/components/forms/SubmitButton'
// @ts-expect-error
import { useFormState } from 'react-dom'

type DeleteAccountFormParams = {
    submit: (prevState: any, formData: FormData) => void,
}

export default function DeleteAccountForm({ submit }: DeleteAccountFormParams) {
    const [formState, formAction] = useFormState(submit, {});

    async function onSubmit(e: React.FormEvent) {
        if (confirm('Are you sure?')) {
            if (confirm('Are you really sure?')) {
                return;
            }
        }

        e.preventDefault();
    }

    return (
        <form
            action={formAction}
            onSubmit={onSubmit}>
            <SubmitButton
                variant='destructive'>
                Delete account
            </SubmitButton>
        </form>
    )
}