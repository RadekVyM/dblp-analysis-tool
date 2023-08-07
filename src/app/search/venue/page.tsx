import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'

export default function SearchVenuePage() {
    return (
        <PageContainer>
            <PageTitle
                subtitle='search'
                title='Venues' />
            <div
                className='grid'>
                <p className='w-[fit-content] relative place-self-center'>Hello Search Venue page!</p>
            </div>
        </PageContainer>
    )
}