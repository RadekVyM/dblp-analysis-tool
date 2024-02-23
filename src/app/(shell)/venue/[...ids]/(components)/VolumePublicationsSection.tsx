'use client'

import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useMemo } from 'react';

type VolumePublicationsSectionParams = {
    volumes: Array<DblpVenueVolume>,
}

/** Displays a page section with a list of volume publications that can be filtered. */
export default function VolumePublicationsSection({ volumes }: VolumePublicationsSectionParams) {
    const allPublications = useMemo(() => {
        const publicationsMap = new Map<string, DblpPublication>();
        volumes.forEach((v) => v.publications.forEach((p) => publicationsMap.set(p.id, p)));
        return [...publicationsMap.values()];
    }, [volumes]);

    return (
        <PageSection>
            <header
                className='mb-4 flex gap-3 items-center'>
                <PageSectionTitle className='text-xl mb-0'>Publications</PageSectionTitle>
            </header>

            <GroupedPublicationsList
                publications={allPublications} />
        </PageSection>
    );
}