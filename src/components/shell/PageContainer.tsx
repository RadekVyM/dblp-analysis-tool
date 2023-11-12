import { cn } from '@/utils/tailwindUtils'

type PageContainerParams = {
    children: React.ReactNode,
    className?: string
}

export default function PageContainer({ children, className }: PageContainerParams) {
    return (
        <main
            className={cn('flex flex-col pt-2 w-full h-full', className)}>
            {children}
        </main>
    )
}