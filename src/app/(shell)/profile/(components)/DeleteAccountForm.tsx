'use client'

import SubmitButton from '@/components/forms/SubmitButton'
import { NotificationType } from '@/enums/NotificationType'
import useNotifications from '@/hooks/useNotifications'
import { submitDeleteAccountForm } from '@/services/auth/server/forms'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
// @ts-expect-error
import { useFormState } from 'react-dom'

type DeleteAccountFormParams = {
}

export default function DeleteAccountForm({ }: DeleteAccountFormParams) {
    const [formState, formAction] = useFormState(submitDeleteAccountForm, {});
    const { pushNotification } = useNotifications();
    const router = useRouter();

    useEffect(() => {
        if (formState.success) {
            router.push('/');

            pushNotification({
                key: 'ACCOUNT_DELETED',
                message: 'Your account has been deleted succesfully',
                type: NotificationType.Success,
                autoclose: true
            });

            signOut({ redirect: false }).then();
        }
        else if (formState.error) {
            pushNotification({
                key: 'ACCOUNT_NOT_DELETED',
                message: formState.error,
                type: NotificationType.Error,
                autoclose: false
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