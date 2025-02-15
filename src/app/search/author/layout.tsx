import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'

type SearchAurhorLayoutParams = {
    children: React.ReactNode
}

/** Layout of the author search page. */
export default function SearchAurhorLayout({ children }: SearchAurhorLayoutParams) {
    return (
        <PageContainer>
            <PageTitle
                annotation='search'
                title='Authors' />
            {children}
        </PageContainer>
    )
}