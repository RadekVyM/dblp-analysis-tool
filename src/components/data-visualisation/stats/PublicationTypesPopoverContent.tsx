import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationType } from '@/enums/PublicationType'
import * as d3 from 'd3'

type PublicationTypesPopoverContentParams = {
    publicationTypes: d3.InternMap<PublicationType, number>
}

export default function PublicationTypesPopoverContent({ publicationTypes }: PublicationTypesPopoverContentParams) {
    return (
        <dl
            className='px-3 py-2 text-xs grid grid-cols-[auto_auto] gap-x-3 gap-y-1'>
            {[...publicationTypes.keys()].map((type) =>
                <div
                    key={type}
                    className='col-span-2 grid grid-cols-subgrid'>
                    <dt className='font-semibold'>{PUBLICATION_TYPE_TITLE[type]}:</dt>
                    <dd className='justify-self-end'>{publicationTypes.get(type)}</dd>
                </div>)}
        </dl>
    )
}