'use client'

// @ts-expect-error
import { useFormState } from 'react-dom'
import Input from '../../../components/forms/Input'
import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import signInValidator from '@/validation/signInValidator'
import { SignInInputs } from '@/validation/schemas/SignInSchema'
import ErrorMessage from '../../../components/forms/ErrorMessage'
import { anyKeys } from '@/utils/objects'
import SubmitButton from '@/components/forms/SubmitButton'
import Form from '@/components/forms/Form'
import { submitSignInForm } from '@/services/auth/forms'

type SignInFormParams = {
    className?: string
}

export default function SignInForm({ className }: SignInFormParams) {
    const [formValues, setFormValues] = useState<SignInInputs>({
        email: '',
        password: '',
    });
    const [formState, formAction] = useFormState(submitSignInForm, {});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const router = useRouter();

    useEffect(() => {
        if (formState.success) {
            router.push('/');
        }
    }, [formState]);

    async function onSubmit(e: React.FormEvent) {
        setLoading(true);
        const err = signInValidator({ ...formValues });
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

            {formState?.error && <ErrorMessage>{formState?.error}</ErrorMessage>}

            <SubmitButton
                className='w-full mt-4'
                loading={loading}>
                Sign in
            </SubmitButton>
        </Form>
    )
}