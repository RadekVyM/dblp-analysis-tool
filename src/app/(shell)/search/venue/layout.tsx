import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import VenueSelection from './(components)/VenueSelection'

type SearchVenueLayoutParams = {
    children: React.ReactNode
}

export default function SearchVenueLayout({ children }: SearchVenueLayoutParams) {
    return (
        <PageContainer>
            <PageTitle
                subtitle='search'
                title='Venues' />
            <VenueSelection
                className='mb-8' />
            {children}
        </PageContainer>
    )
}
