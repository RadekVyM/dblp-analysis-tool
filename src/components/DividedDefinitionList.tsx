import { cn } from '@/utils/tailwindUtils'

export type DefinitionListItem = { term: string, definition: string }

type DividedDefinitionListParams = {
    items: Array<DefinitionListItem>,
    className?: string
}

/** Definition list that is displayed horizontally on wide screens and individual pairs are divided by a separator. */
export default function DividedDefinitionList({ items, className }: DividedDefinitionListParams) {
    return (
        <dl
            className={cn('flex flex-col sm:flex-row sm:items-center text-sm gap-x-1 gap-y-2', className)}>
            {items.map((item, index) =>
                <div key={item.term} className='flex items-center text-sm gap-1'>
                    {
                        index !== 0 &&
                        <div className='hidden sm:block mx-2 h-5 w-0.5 bg-outline'></div>
                    }
                    <dt className='min-w-0'>{item.term}</dt>
                    <dd className='min-w-0 font-semibold'>{item.definition}</dd>
                </div>)}
        </dl>
    )
}