'use client'

import ErrorMessage from '@/components/forms/ErrorMessage'
import Form from '@/components/forms/Form'
import Input from '@/components/forms/Input'
import SubmitButton from '@/components/forms/SubmitButton'
import { NotificationType } from '@/enums/NotificationType'
import useNotifications from '@/hooks/useNotifications'
import { submitChangeUserInfoForm } from '@/services/auth/server/forms'
import { updatedSession } from '@/services/auth/client'
import { anyKeys } from '@/utils/objects'
import changeUserInfoValidator from '@/validation/changeUserInfoValidator'
import { ChangeUserInfoInputs } from '@/validation/schemas/ChangeUserInfoSchema'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
// @ts-expect-error
import { useFormState } from 'react-dom'

type YourInfoFormParams = {
}

export default function YourInfoForm({ }: YourInfoFormParams) {
    const [formValues, setFormValues] = useState<ChangeUserInfoInputs>({
        email: '',
        username: ''
    });
    const [formState, formAction] = useFormState(submitChangeUserInfoForm, {});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();
    const { pushNotification } = useNotifications();

    useEffect(() => {
        // Update session after successful form submit 
        if (formState.success && formState?.email && formState?.username) {
            const newSession = updatedSession(session, formState?.username, formState?.email);
            updateSession(newSession)
                .then(() => { });

            pushNotification({
                key: 'PROFILE_INFO_CHANGED',
                message: 'Your profile information has been changed succesfully',
                type: NotificationType.Success,
                autoclose: true
            });
        }
    }, [formState]);

    useEffect(() => {
        if (session?.user) {
            setFormValues({
                username: session.user.name || '',
                email: session.user.email || ''
            })
        }
    }, [session]);

    async function onSubmit(e: React.FormEvent) {
        setLoading(true);
        const err = changeUserInfoValidator({ ...formValues });
        setErrors(err);

        if (anyKeys(err)) {
            e.preventDefault();
        }

        setLoading(false);
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormValues((old) => ({ ...old, [name]: value }));
    }

    return (
        <Form
            action={formAction}
            onSubmit={onSubmit}
            className='max-w-xl'>
            <Input
                id='profile-name'
                label='Name'
                name='username'
                required
                defaultValue={session?.user?.name || ''}
                onChange={handleChange}
                error={errors?.username && 'Name must contain at least 1 character.'} />
            <Input
                id='profile-email'
                label='E-mail'
                type='email'
                name='email'
                required
                defaultValue={session?.user?.email || ''}
                onChange={handleChange}
                error={errors?.email && 'Invalid e-mail address.'} />

            {formState?.error && <ErrorMessage>{formState?.error}</ErrorMessage>}

            <SubmitButton
                className='self-end mt-4'
                disabled={session?.user?.name === formValues.username && session?.user?.email === formValues.email}
                loading={loading}>
                Save changes
            </SubmitButton>
        </Form>
    )
}