'use client'

import Button from "@/components/Button"
import { signOut } from "next-auth/react"

export default function SignOutPage() {
    return (
        <Button
            onClick={async () => await signOut()}>
            Sign Out
        </Button>
    )
}