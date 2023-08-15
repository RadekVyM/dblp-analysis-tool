'use client'

import Button from '@/app/(components)/Button'
import { SearchParams } from '@/shared/dtos/SearchParams'
import { SearchType } from '@/shared/enums/SearchType'
import { VenueType, getVenueTypeByKey } from '@/shared/enums/VenueType'
import { cn } from '@/shared/utils/tailwindUtils'
import { createLocalSearchPath } from '@/shared/utils/urls'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type VenueSelectionParams = {
    className?: string
}

export default function VenueSelection({ className }: VenueSelectionParams) {
    const searchParams = useSearchParams();
    const [journalsUrl, setJournalsUrl] = useState('');
    const [conferencesUrl, setConferencesUrl] = useState('');
    const [seriesUrl, setSeriesUrl] = useState('');
    const [type, setType] = useState(VenueType.Journal);

    useEffect(() => {
        const params: SearchParams = {};

        for (const entry of searchParams.entries()) {
            params[entry[0]] = entry[1];
        }

        params.page = '1';

        setType((params.type ? getVenueTypeByKey(params.type) : undefined) || VenueType.Journal);
        setJournalsUrl(createLocalSearchPath(SearchType.Venue, { ...params, ...{ type: VenueType.Journal } }));
        setConferencesUrl(createLocalSearchPath(SearchType.Venue, { ...params, ...{ type: VenueType.Conference } }));
        setSeriesUrl(createLocalSearchPath(SearchType.Venue, { ...params, ...{ type: VenueType.Series } }));
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