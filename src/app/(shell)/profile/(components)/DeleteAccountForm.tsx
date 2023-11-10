'use client'

import SubmitButton from '@/components/forms/SubmitButton'
import { NotificationType } from '@/enums/NotificationType'
import useNotifications from '@/hooks/useNotifications'
import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
// @ts-expect-error
import { useFormState } from 'react-dom'

type DeleteAccountFormParams = {
    submit: (prevState: any, formData: FormData) => void,
}

export default function DeleteAccountForm({ submit }: DeleteAccountFormParams) {
    const [formState, formAction] = useFormState(submit, {});
    const { pushNotification } = useNotifications();

    useEffect(() => {
        if (formState.success) {
            signOut().then();

            pushNotification({
                key: 'ACCOUNT_DELETED',
                message: 'Your account has been deleted succesfully',
                type: NotificationType.Success,
                autoclose: true
            });
        }
    }, [formState]);

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