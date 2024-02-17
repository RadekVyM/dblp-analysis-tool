import { cn } from '@/utils/tailwindUtils'

type DataVisualisationContainerParams = {
    children: React.ReactNode,
    className?: string
}

/** Container element that is used for graphs, charts and their menus. */
export default function DataVisualisationContainer({ children, className }: DataVisualisationContainerParams) {
    return (
        <div
            className={cn('@container bg-surface-container rounded-lg border border-outline', className)}>
            {children}
        </div>
    )
}