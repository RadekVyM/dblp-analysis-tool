'use client'

// @ts-expect-error
import { useFormState, useFormStatus } from 'react-dom'
import Button from '@/components/Button'
import Input from './Input'
import { cn } from '@/utils/tailwindUtils'

type RegisterFormParams = {
    submit: (prevState: any, formData: FormData) => void,
    className?: string
}

export default function SignUpForm({ submit, className }: RegisterFormParams) {
    const [error, formAction] = useFormState(submit, {});

    return (
        <form
            action={formAction}
            className={cn('flex flex-col gap-2 items-center', className)}>
            <p>{error?.error}</p>

            <Input
                id='signup-username'
                label='Username'
                type='text'
                name='username'
                required />
            <Input
                id='signup-email'
                label='E-mail'
                type='email'
                name='email'
                required />
            <Input
                id='signup-password'
                label='Password'
                type='password'
                name='password'
                required />
            <Button
                className='w-full mt-4'
                type='submit'>
                Sign Up
            </Button>
        </form>
    )
}