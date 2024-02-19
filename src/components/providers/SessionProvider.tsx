'use client'

import { Session } from '@/dtos/Session'
import { createContext } from 'react'

type SessionContextParams = {
    children: React.ReactNode,
    session: Session | null
}

export const SessionContext = createContext<Session | null>(null);

export default function SessionProvider({ children, session }: SessionContextParams) {
    return (
        <SessionContext.Provider
            value={session}>
            {children}
        </SessionContext.Provider>
    )
}