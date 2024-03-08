import '@/css/colors.css'
import '@/css/globals.css'
import '@/css/button.css'
import type { Metadata } from 'next'
import { Inter, Gabarito } from 'next/font/google'
import { UNDOCKED_SIDE_MENU_CLASSES } from '@/constants/sideMenu'
import SiteHeader from '@/components/shell/SiteHeader'
import { cn } from '@/utils/tailwindUtils'
import SiteFooter from '@/components/shell/SiteFooter'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'dblp Analysis Tool',
  description: 'dblp analysis tool',
};

/** Root layout of the entire site. */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div
          className='min-h-screen grid grid-rows-[auto_1fr_auto] grid-cols-[1fr]'>
          <SiteHeader
            className='row-start-1 row-end-2 col-start-1 col-end-3' />

          <div
            id='main-content-container'
            className={cn(
              'row-start-2 row-end-3 col-start-1 col-end-2 max-w-screen-xl px-4 mx-auto w-full grid transition-all mt-32 md:mt-16',
              UNDOCKED_SIDE_MENU_CLASSES.join(' '))}>
            <div
              className='row-start-1 row-end-2 col-start-1 col-end-2'>
              {children}
            </div>
            <div
              id='saveditems-menu-container'
              className='row-start-1 row-end-2 col-start-1 col-end-3 justify-self-end h-full bg-transparent pointer-events-none min-w-0'>
            </div>
          </div>

          <SiteFooter
            className='row-start-3 row-end-4 col-start-1 col-end-2' />
        </div>

        <Popovers />
      </body>
    </html>
  )
}

function Popovers() {
  return (
    <div
      id='popover-container'
      className='fixed inset-0 pointer-events-none overflow-clip'>
    </div>
  )
}