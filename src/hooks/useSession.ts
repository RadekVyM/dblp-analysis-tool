'use client'
import { SessionContext } from '@/components/providers/SessionProvider'
import { useContext } from 'react'

export default function useSession() {
    const session = useContext(SessionContext);
    return session;
}