import { getCurrentLocale } from '@/utils/locales'
import { cn } from '@/utils/tailwindUtils'

type GraphStatsParams = {
    nodesCount: number,
    linksCount: number,
    className?: string
}

/** Displays graph node and link counts. */
export default function GraphStats({ nodesCount, linksCount, className }: GraphStatsParams) {
    return (
        <div
            className={cn(className)}>
            <dl
                className='grid text-xs grid-cols-[1fr_auto] gap-x-2 ml-auto w-max'>
                <dt className='font-semibold'>Nodes count: </dt>
                <dd className='justify-self-end'>{nodesCount.toLocaleString(getCurrentLocale(), { useGrouping: true })}</dd>
                <dt className='font-semibold'>Links count: </dt>
                <dd className='justify-self-end'>{linksCount.toLocaleString(getCurrentLocale(), { useGrouping: true })}</dd>
            </dl>
        </div>
    )
}