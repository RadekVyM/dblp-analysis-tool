'use client'

// @ts-expect-error
import { useFormState } from 'react-dom'
import Input from '../../../components/forms/Input'
import { ChangeEvent, useEffect, useState } from 'react'
import { SignUpInputs } from '@/validation/schemas/SignUpSchema'
import signUpValidator from '@/validation/signUpValidator'
import ErrorMessage from '../../../components/forms/ErrorMessage'
import { anyKeys } from '@/utils/objects'
import SubmitButton from '@/components/forms/SubmitButton'
import Form from '@/components/forms/Form'
import { useRouter } from 'next/navigation'
import useNotifications from '@/hooks/useNotifications'
import { NotificationType } from '@/enums/NotificationType'
import { submitSignUpForm } from '@/services/auth/server/forms'

type RegisterFormParams = {
    className?: string
}

export default function SignUpForm({ className }: RegisterFormParams) {
    const [formValues, setFormValues] = useState<SignUpInputs>({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [formState, formAction] = useFormState(submitSignUpForm, {});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const { pushNotification } = useNotifications();
    const router = useRouter();

    useEffect(() => {
        if (formState.success) {
            pushNotification({
                key: 'ACCOUNT_REGISTERED',
                message: 'Your account has been created succesfully',
                type: NotificationType.Success,
                autoclose: true
            });
            router.push('/auth/signin')
        }
    }, [formState]);

    async function onSubmit(e: React.FormEvent) {
        setLoading(true);
        const err = signUpValidator({ ...formValues });
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
            className={className}>
            <Input
                id='signup-username'
                label='Name'
                type='text'
                name='username'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.username && 'Name must contain at least 1 character.'} />
            <Input
                id='signup-email'
                label='E-mail'
                type='email'
                name='email'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.email && 'Invalid e-mail address.'} />
            <Input
                id='signup-password'
                label='Password'
                type='password'
                name='password'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.password && 'Password must be at least 8 characters long and contain uppercase and lowercase letters and a numeric or special symbol.'} />
            <Input
                id='signup-password-confirm'
                label='Confirm Password'
                type='password'
                name='confirmPassword'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.confirmPassword && 'Passwords do not match.'} />

            {formState?.error && <ErrorMessage>{formState?.error}</ErrorMessage>}

            <SubmitButton
                className='w-full mt-4'
                loading={loading}>
                Sign up
            </SubmitButton>
        </Form>
    )
}