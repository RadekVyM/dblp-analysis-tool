import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import HeaderAuthorGroupsMenu from './(components)/HeaderAuthorGroupsMenu'

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
      <body className={inter.className + ' min-h-screen grid grid-rows-[auto_1fr_auto] grid-cols-[1fr]'}>
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
      <HeaderAuthorGroupsMenu />

      <div
        id='main-content-container'
        className='row-start-2 row-end-3 col-start-1 col-end-2 max-w-screen-xl px-4 mx-auto w-full grid transition-all'>
        <div
          className='col-start-1 col-end-2'>
          {children}
        </div>
      </div>

      <footer
        className='row-start-3 row-end-4 col-start-1 col-end-2 border-t border-gray-200 dark:border-gray-800'>
        <div
          className='max-w-screen-xl px-4 py-5 mx-auto w-full'>
          <span className='text-sm'>© 2023 Radek Vymětalík</span>
        </div>
      </footer>
    </>
  )
}
