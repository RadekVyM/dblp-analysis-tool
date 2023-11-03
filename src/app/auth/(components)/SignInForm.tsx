'use client'

import Button from '@/components/Button'
import Input from './Input'
import { ChangeEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/utils/tailwindUtils'

type SignInFormParams = {
    className?: string
}

export default function SignInForm({ className }: SignInFormParams) {
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await signIn('credentials', {
                email: formValues.email,
                password: formValues.password,
                callbackUrl
            });

            if (!response?.error) {
                router.push(callbackUrl);
            }
        }
        catch (error) {

        }
        finally {
            setLoading(false);
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    }

    return (
        <form
            onSubmit={onSubmit}
            className={cn('flex flex-col gap-2 items-center', className)}>
            <p>{searchParams?.get('error')}</p>
            <Input
                id='signin-email'
                label='E-mail'
                type='email'
                name='email'
                required
                disabled={loading}
                onChange={handleChange} />
            <Input
                id='signin-password'
                label='Password'
                type='password'
                name='password'
                required
                disabled={loading}
                onChange={handleChange} />
            <Button
                className='w-full mt-4'
                type='submit'
                disabled={loading}>
                Sign In
            </Button>
        </form>
    )
}