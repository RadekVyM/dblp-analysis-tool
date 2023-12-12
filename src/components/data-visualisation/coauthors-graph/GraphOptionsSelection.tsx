'use client'

import CheckListButton from '@/components/CheckListButton'
import { GraphOptions } from '@/dtos/GraphOptions'

type GraphOptionsSelectionParams = {
    options: GraphOptions,
    nodesCount: number,
    linksCount: number,
    setOptions: (options: Partial<GraphOptions>) => void
}

export default function GraphOptionsSelection({ options, nodesCount, linksCount, setOptions }: GraphOptionsSelectionParams) {
    return (
        <>
            <CheckListButton
                className='w-auto'
                isSelected={options.originalLinksDisplayed}
                onClick={() => setOptions({ originalLinksDisplayed: !options.originalLinksDisplayed })}>
                Show original links
            </CheckListButton>
            <div
                className='flex-1 flex justify-end mr-2'>
                <dl
                    className='grid text-xs grid-cols-[1fr_auto] gap-x-2'>
                    <dt className='font-semibold'>Nodes count: </dt>
                    <dd className='justify-self-end'>{nodesCount}</dd>
                    <dt className='font-semibold'>Links count: </dt>
                    <dd className='justify-self-end'>{linksCount}</dd>
                </dl>
            </div>
        </>
    )
}