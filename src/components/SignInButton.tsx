'use client'

import { signIn } from 'next-auth/react'
import Button from '@/components/Button'
import { FaUser } from 'react-icons/fa'

export default function SignInButton() {
    return (
        <Button
            title='Sign in'
            variant='icon-outline'
            onClick={() => signIn()}>
            <FaUser />
        </Button>
    )
}