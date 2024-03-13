'use client'

import Button from '@/components/inputs/Button'
import { SearchParams } from '@/dtos/search/SearchParams'
import { SearchType } from '@/enums/SearchType'
import { VenueType, getVenueTypeByKey } from '@/enums/VenueType'
import { cn } from '@/utils/tailwindUtils'
import { createLocalSearchPath } from '@/utils/urls'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type VenueSelectionParams = {
    className?: string
}

/** Tabs for selection of displayed veneus. */
export default function VenueSelection({ className }: VenueSelectionParams) {
    const searchParams = useSearchParams();
    const { journalsUrl, conferencesUrl, seriesUrl, type } = useMemo(() => {
        const params: SearchParams = {};

        for (const entry of searchParams.entries()) {
            params[entry[0]] = entry[1];
        }

        params.page = '1';

        return {
            type: (params.type ? getVenueTypeByKey(params.type) : undefined) || VenueType.Journal,
            journalsUrl: createLocalSearchPath(SearchType.Venue, { ...params, ...{ type: VenueType.Journal } }),
            conferencesUrl: createLocalSearchPath(SearchType.Venue, { ...params, ...{ type: VenueType.Conference } }),
            seriesUrl: createLocalSearchPath(SearchType.Venue, { ...params, ...{ type: VenueType.Series } })
        };
    }, [searchParams]);

    return (
        <div
            className={cn('flex gap-2', className)}>
            <Button
                size='sm' variant={type == VenueType.Journal ? 'default' : 'outline'}
                href={journalsUrl}>
                Journals
            </Button>
            <Button
                size='sm' variant={type == VenueType.Conference ? 'default' : 'outline'}
                href={conferencesUrl}>
                Conferences
            </Button>
            <Button
                size='sm' variant={type == VenueType.Series ? 'default' : 'outline'}
                href={seriesUrl}>
                Series
            </Button>
        </div>
    )
}