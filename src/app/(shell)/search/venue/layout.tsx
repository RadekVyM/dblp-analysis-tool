import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
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
