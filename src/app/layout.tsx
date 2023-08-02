import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import PageHeader from './(components)/PageHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'dblp Analysis Tool',
  description: 'dblp analysis tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className + ' min-h-screen flex flex-col'}>
        <Scaffold>{children}</Scaffold>
      </body>
    </html>
  )
}

function Scaffold({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageHeader />

      <div
        className='flex-1 max-w-screen-xl px-4 mx-auto w-full'>
        {children}
      </div>

      <footer
        className='border-t border-gray-200 dark:border-gray-800'>
        <div
          className='max-w-screen-xl px-4 py-5 mx-auto w-full'>
          <span className='text-sm'>© 2023 Radek Vymětalík</span>
        </div>
      </footer>
    </>
  )
}
