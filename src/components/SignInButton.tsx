'use client'

import { signIn } from 'next-auth/react'
import Button from '@/components/Button'
import { FaUserAlt } from 'react-icons/fa'

export default function SignInButton() {
    return (
        <Button
            variant='icon-outline'
            onClick={() => signIn()}>
            <FaUserAlt />
        </Button>
    )
}