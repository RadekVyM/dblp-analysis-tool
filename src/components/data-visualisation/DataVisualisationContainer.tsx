import { cn } from '@/utils/tailwindUtils'

type DataVisualisationContainerParams = {
    children: React.ReactNode,
    className?: string
}

export default function DataVisualisationContainer({ children, className }: DataVisualisationContainerParams) {
    return (
        <div
            className={cn('@container bg-surface-container rounded-lg border border-outline', className)}>
            {children}
        </div>
    )
}