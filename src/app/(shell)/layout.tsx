import SiteHeader from '@/components/shell/SiteHeader'
import { UNDOCKED_SIDE_MENU_CLASSES } from '@/constants/sideMenu'
import { cn } from '@/utils/tailwindUtils'
import Link from 'next/link'

export default function ShellLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Scaffold>{children}</Scaffold>
    )
}

function Scaffold({
    children
}: {
    children: React.ReactNode
}) {
    return (
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

            <footer
                className='row-start-3 row-end-4 col-start-1 col-end-2 border-t border-gray-200 dark:border-gray-800'>
                <div
                    className='max-w-screen-xl px-4 py-5 mx-auto w-full flex justify-between'>
                    <span className='text-sm'>© 2024 Radek Vymětalík</span>
                    <span className='text-sm'>
                        Data source: <Link className='hover:underline' href='https://dblp.org' prefetch={false}>dblp.org</Link>
                    </span>
                </div>
            </footer>
        </div>
    )
}