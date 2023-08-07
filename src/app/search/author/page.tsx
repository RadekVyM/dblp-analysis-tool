import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'

export default function SearchAuthorPage() {
    return (
        <PageContainer>
            <PageTitle
                subtitle='search'
                title='Authors' />
            <p className='w-[fit-content] relative'>Hello Search Author page!</p>
        </PageContainer>
    )
}