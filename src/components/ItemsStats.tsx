import { cn } from '@/utils/tailwindUtils'

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
            <div className='hidden xs:block mx-2 h-5 w-0.5 bg-outline'></div>
            <dt>Displayed count:</dt>
            <dd className='font-semibold'>{displayedCount.toLocaleString(undefined, { useGrouping: true })}</dd>
        </dl>
    )
}