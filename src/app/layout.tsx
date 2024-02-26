import './globals.css'
import type { Metadata } from 'next'
import { Inter, Gabarito } from 'next/font/google'
import Notifications from '@/components/shell/Notifications'

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
  return (
    <html lang='en' className='scroll-pt-36'>
      <body className={inter.className}>
        {children}
        <Notifications />
      </body>
    </html>
  )
}