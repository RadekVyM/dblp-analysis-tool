'use client'

import ErrorMessage from '@/components/forms/ErrorMessage'
import Form from '@/components/forms/Form'
import Input from '@/components/forms/Input'
import SubmitButton from '@/components/forms/SubmitButton'
import { NotificationType } from '@/enums/NotificationType'
import useNotifications from '@/hooks/useNotifications'
import { anyKeys } from '@/utils/objects'
import { isNullOrWhiteSpace } from '@/utils/strings'
import changePasswordValidator from '@/validation/changePasswordValidator'
import { ChangePasswordInputs } from '@/validation/schemas/ChangePasswordSchema'
import { ChangeEvent, useEffect, useState } from 'react'
// @ts-expect-error
import { useFormState } from 'react-dom'

type ChangePasswordFormParams = {
    submit: (prevState: any, formData: FormData) => void,
}

export default function ChangePasswordForm({ submit }: ChangePasswordFormParams) {
    const [formValues, setFormValues] = useState<ChangePasswordInputs>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [formState, formAction] = useFormState(submit, {});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const { pushNotification } = useNotifications();

    useEffect(() => {
        if (formState.success) {
            setFormValues({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });

            pushNotification({
                key: 'PASSWORD_CHANGED',
                message: 'Your password has been changed succesfully',
                type: NotificationType.Success,
                autoclose: true
            });
        }
    }, [formState]);

    async function onSubmit(e: React.FormEvent) {
        setLoading(true);
        const err = changePasswordValidator({ ...formValues });
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
                id='profile-old-password'
                type='password'
                label='Current password'
                name='currentPassword'
                required
                value={formValues.currentPassword}
                onChange={handleChange}
                error={errors?.currentPassword && 'Invalid password.'} />
            <Input
                id='profile-new-password'
                type='password'
                label='New password'
                name='newPassword'
                required
                value={formValues.newPassword}
                onChange={handleChange}
                error={errors?.newPassword && 'Password must be at least 8 characters long and contain uppercase and lowercase letters and a numeric or special symbol.'} />
            <Input
                id='profile-confirm-new-password'
                type='password'
                label='Confirm new password'
                name='confirmNewPassword'
                required
                value={formValues.confirmNewPassword}
                onChange={handleChange}
                error={errors?.confirmNewPassword && 'Passwords do not match.'} />

            {formState?.error && <ErrorMessage>{formState?.error}</ErrorMessage>}

            <SubmitButton
                className='self-end mt-4'
                loading={loading}
                disabled={Object.values(formValues).some((v) => isNullOrWhiteSpace(v))}>
                Change password
            </SubmitButton>
        </Form>
    )
}