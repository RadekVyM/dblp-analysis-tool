type PageContainerParams = {
    children: React.ReactNode
}

export default function PageContainer({ children }: PageContainerParams) {
    return (
        <main
            className='flex flex-col pt-2 w-full h-full'>
            {children}
        </main>
    )
}