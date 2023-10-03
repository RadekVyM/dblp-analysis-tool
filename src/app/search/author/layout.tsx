import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'

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