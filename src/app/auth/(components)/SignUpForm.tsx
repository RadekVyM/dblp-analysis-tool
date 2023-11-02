'use client'

// @ts-expect-error
import { useFormState, useFormStatus } from 'react-dom'
import Button from '@/components/Button'
import Input from './Input'

type RegisterFormParams = {
    submit: (prevState: any, formData: FormData) => void
}

export default function SignUpForm({ submit }: RegisterFormParams) {
    const [error, formAction] = useFormState(submit, {});

    console.log(error);

    return (
        <>
            <p>{error?.error}</p>
            <form
                action={formAction}
                className='flex flex-col gap-2 items-center'>
                <Input
                    id='signin-username'
                    label='Username'
                    type='text'
                    name='username' />
                <Input
                    id='signup-email'
                    label='E-mail'
                    type='email'
                    name='email' />
                <Input
                    id='signin-password'
                    label='Password'
                    type='password'
                    name='password' />
                <Button
                    type='submit'>
                    Sign Up
                </Button>
            </form>
        </>
    )
}