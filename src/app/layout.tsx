import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'dblp Analysis Tool',
  description: 'dblp analysis tool',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();

  return (
    <html lang='en' className='scroll-pt-36'>
      <body className={inter.className}>
        <SessionProvider
          session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}