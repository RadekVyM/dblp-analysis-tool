'use client'

// @ts-expect-error
import { useFormState, useFormStatus } from 'react-dom'
import Button from '@/components/Button'
import Input from './Input'
import { cn } from '@/utils/tailwindUtils'
import { ChangeEvent, useState } from 'react'
import { SignUpInputs } from '@/validation/schemas/SignUpSchema'
import signUpValidator from '@/validation/signUpValidator'

type RegisterFormParams = {
    submit: (prevState: any, formData: FormData) => void,
    className?: string
}

export default function SignUpForm({ submit, className }: RegisterFormParams) {
    const [formValues, setFormValues] = useState<SignUpInputs>({
        email: '',
        username: '',
        password: '',
    });
    const [error, formAction] = useFormState(submit, {});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});

    async function onSubmit(e: React.FormEvent) {
        setLoading(true);
        const err = signUpValidator({ ...formValues });
        setErrors(err);

        if (Object.keys(err).length !== 0) {
            e.preventDefault();
        }

        setLoading(false);
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    }

    return (
        <form
            action={formAction}
            onSubmit={onSubmit}
            className={cn('flex flex-col gap-2 items-stretch', className)}>
            <Input
                id='signup-username'
                label='Name'
                type='text'
                name='username'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.username && 'Name must contain at least 1 character'} />
            <Input
                id='signup-email'
                label='E-mail'
                type='email'
                name='email'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.email && 'Invalid e-mail address'} />
            <Input
                id='signup-password'
                label='Password'
                type='password'
                name='password'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.password && 'Password must contain at least 8 alphanumeric characters'} />

            {error?.error && <span className='text-xs text-danger'>{error?.error}</span>}

            <Button
                className='w-full mt-4'
                type='submit'
                disabled={loading}>
                Sign Up
            </Button>
        </form>
    )
}