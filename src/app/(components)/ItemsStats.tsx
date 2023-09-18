import { cn } from "@/shared/utils/tailwindUtils"

type ItemsStatsParams = {
    totalCount: number,
    displayedCount: number,
    className?: string
}

export default function ItemsStats({ totalCount, displayedCount, className }: ItemsStatsParams) {
    return (
        <dl
            className={cn('flex flex-col xs:flex-row xs:items-center text-sm gap-1', className)}>
            <dt>Total count:</dt>
            <dd className='font-semibold'>{totalCount.toLocaleString(undefined, { useGrouping: true })}</dd>
            <div className='hidden xs:block mx-2 h-full w-0.5 bg-outline'></div>
            <dt>Displayed count:</dt>
            <dd className='font-semibold'>{displayedCount}</dd>
        </dl>
    )
}