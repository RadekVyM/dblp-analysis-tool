'use client'

import Input from '../../../components/forms/Input'
import { ChangeEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/services/auth/client'
import signInValidator from '@/validation/signInValidator'
import { SignInInputs } from '@/validation/schemas/SignInSchema'
import ErrorMessage from '../../../components/forms/ErrorMessage'
import { anyKeys } from '@/utils/objects'
import SubmitButton from '@/components/forms/SubmitButton'
import Form from '@/components/forms/Form'

type SignInFormParams = {
    className?: string
}

export default function SignInForm({ className }: SignInFormParams) {
    const [formValues, setFormValues] = useState<SignInInputs>({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setLoading(true);
            const err = signInValidator({ ...formValues });
            setErrors(err);

            if (anyKeys(err)) {
                return
            }

            await signIn(formValues.email, formValues.password, callbackUrl);

            router.push(callbackUrl);
        }
        catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
        finally {
            setLoading(false);
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormValues((old) => ({ ...old, [name]: value }));
    }

    return (
        <Form
            onSubmit={onSubmit}
            className={className}>
            <Input
                id='signin-email'
                label='E-mail'
                type='email'
                name='email'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.email && 'Invalid e-mail address.'} />
            <Input
                id='signin-password'
                label='Password'
                type='password'
                name='password'
                required
                disabled={loading}
                onChange={handleChange}
                error={errors?.password && 'Invalid password.'} />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton
                className='w-full mt-4'
                loading={loading}>
                Sign in
            </SubmitButton>
        </Form>
    )
}