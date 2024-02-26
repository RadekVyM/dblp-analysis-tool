import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import VenueSelection from './(components)/VenueSelection'
import { Suspense } from 'react'

type SearchVenueLayoutParams = {
    children: React.ReactNode
}

export default function SearchVenueLayout({ children }: SearchVenueLayoutParams) {
    return (
        <PageContainer>
            <PageTitle
                subtitle='search'
                title='Venues' />
            <Suspense>
                <VenueSelection
                    className='mb-8' />
            </Suspense>
            {children}
        </PageContainer>
    )
}
