'use client'

import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import { DblpPublication } from '@/dtos/DblpPublication'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { useMemo } from 'react';

type VolumePublicationsParams = {
    volumes: Array<DblpVenueVolume>,
}

export default function VolumePublications({ volumes }: VolumePublicationsParams) {
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