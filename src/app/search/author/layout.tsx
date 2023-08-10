import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'

type SearchAurhorLayoutParams = {
    children: React.ReactNode
}

export default function SearchAurhorLayout({ children }: SearchAurhorLayoutParams) {
    return (
        <PageContainer>
            <PageTitle
                subtitle='search'
                title='Authors' />
            {children}
        </PageContainer>
    )
}