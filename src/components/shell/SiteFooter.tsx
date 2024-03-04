import { cn } from '@/utils/tailwindUtils'
import Link from 'next/link'

type SiteFooterParams = {
    className?: string
}

/** Bottom footer of the entire site that contains some additional information. */
export default function SiteFooter({ className }: SiteFooterParams) {
    return (
        <footer
            className={cn('border-t border-outline-variant', className)}>
            <div
                className='max-w-screen-xl px-4 py-5 mx-auto w-full flex justify-between'>
                <span className='text-sm'>© 2024 Radek Vymětalík</span>
                <span className='text-sm'>
                    Data source: <Link className='hover:underline' href='https://dblp.org' prefetch={false}>dblp.org</Link>
                </span>
            </div>
        </footer>
    )
}