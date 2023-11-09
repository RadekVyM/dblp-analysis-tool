'use client'

// @ts-expect-error
import { useFormState } from 'react-dom'
import Input from '../../../components/forms/Input'
import { cn } from '@/utils/tailwindUtils'
import { ChangeEvent, useState } from 'react'
import { SignUpInputs } from '@/validation/schemas/SignUpSchema'
import signUpValidator from '@/validation/signUpValidator'
import ErrorMessage from '../../../components/forms/ErrorMessage'
import { anyKeys } from '@/utils/objects'
import SubmitButton from '@/components/forms/SubmitButton'
import Form from '@/components/forms/Form'

type RegisterFormParams = {
    submit: (prevState: any, formData: FormData) => void,
    className?: string
}

export default function SignUpForm({ submit, className }: RegisterFormParams) {
    const [formValues, setFormValues] = useState<SignUpInputs>({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, formAction] = useFormState(submit, {});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});

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

            {error?.error && <ErrorMessage>{error?.error}</ErrorMessage>}

            <SubmitButton
                className='w-full mt-4'
                loading={loading}>
                Sign up
            </SubmitButton>
        </Form>
    )
}