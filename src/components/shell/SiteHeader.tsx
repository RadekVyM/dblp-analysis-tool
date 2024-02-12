import NavigationMenu from './NavigationMenu'
import { cn } from '@/utils/tailwindUtils'
import SignInButton from '../SignInButton'
import SiteLogo from './SiteLogo'
import { SavedItemsMenuIntegration } from './SavedItemsMenuIntegration'
import { isAuthorizedOnServer } from '@/services/auth/server'
import Search from './Search'

type SiteHeaderParams = {
    className?: string,
}

export default async function SiteHeader({ className }: SiteHeaderParams) {
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <header
            className={cn('sticky top-0 z-40 backdrop-blur-lg border-b border-outline-variant', className)}>
            <div
                className='grid grid-rows-[auto_auto] grid-cols-[1fr] md:grid-cols-[1fr_auto] max-w-screen-xl w-full mx-auto px-4'>
                <div
                    className='row-start-1 row-end-2 col-start-1 col-end-2 flex place-items-center gap-6 sm:gap-10 h-16'>
                    <SiteLogo />

                    <div
                        className='flex-1 flex flex-col place-items-end'>
                        <NavigationMenu />
                    </div>
                </div>

                <div
                    className='row-start-2 row-end-3 md:row-start-1 md:row-end-2 col-start-1 col-end-2 md:col-start-2 md:col-end-3
                        relative flex gap-5 place-items-center h-16 md:h-auto md:ml-8'>
                    <Search
                        className='md:min-w-[18rem]' />

                    {
                        isAuthorized ?
                            <SavedItemsMenuIntegration /> :
                            <SignInButton />
                    }
                </div>
            </div>
        </header>
    )
}