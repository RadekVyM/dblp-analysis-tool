type PageContainerParams = {
    children: React.ReactNode
}

export default function PageContainer({ children }: PageContainerParams) {
    return (
        <main
            className='pt-6'>
            {children}
        </main>
    )
}