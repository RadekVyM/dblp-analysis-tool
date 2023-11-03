import SiteLogo from '@/components/SiteLogo'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            className='max-w-screen-xl min-h-screen px-4 mx-auto w-full grid grid-rows-[auto_1fr] grid-cols-[1fr]'>
            <header
                className='flex place-items-center h-16'>
                <SiteLogo />
            </header>
            {children}
        </div>
    )
}