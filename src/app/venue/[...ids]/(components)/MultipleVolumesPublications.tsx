'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import VolumePublicationsSection from './VolumePublicationsSection'
import VolumesSelection from './VolumesSelection'
import { DefaultSelectedPublicationsParams } from '@/dtos/DefaultSelectedPublicationsParams'
import { VenuePageContent } from '@/enums/VenuePageContent'
import { useState } from 'react'
import Tabs from '@/components/Tabs'
import { PageSection, PageSectionTitle } from '@/components/shell/PageSection'
import GroupedPublicationsList from '@/components/publications/GroupedPublicationsList'
import useVenueVolumesTitle from '@/hooks/venues/useVenueVolumesTitle'

type MultipleVolumesPublicationsParams = {
    venue: DblpVenue,
    venueId: string,
    /** Volume ID is ignored here. */
    volumeId?: string,
    defaultSelectedVolumeIds?: Array<string>,
} & DefaultSelectedPublicationsParams

/**
 * Content that should be displayed on a venue publications page with multiple venue volumes.
 * This includes volumes selection and the list of publications that can be filtered.
*/
export default function MultipleVolumesPublications({
    venue,
    defaultSelectedYears,
    defaultSelectedTypes,
    defaultSelectedVenueIds,
    defaultSelectedVolumeIds,
    defaultSelectedAuthors
}: MultipleVolumesPublicationsParams) {
    const {
        selectedVolumes,
        selectedVolumeIds,
        toggleVolume,
        toggleVolumes,
        onFetchedVolume
    } = useSelectableFetchableVenueVolumes(venue.volumeGroups, defaultSelectedVolumeIds);
    const [selectedPageContent, setSelectedPageContent] = useState<VenuePageContent>(venue.publications ?
        VenuePageContent.Publications :
        VenuePageContent.Volumes);
    const { hasWideVolumeTitles, volumesTitle } = useVenueVolumesTitle(venue);
    const noContentFound = (!venue.publications || venue.publications.length === 0) && venue.volumeGroups.length === 0 && !(venue.venueAuthorsInfo || venue.venuePublicationsInfo);

    if (noContentFound) {
        return (
            <div className='flex-1 grid place-content-center text-on-surface-muted'>No content found</div>
        )
    }

    return (
        <>
            {
                venue.publications &&
                <Tabs
                    className='mb-8'
                    legend='Select currently displayed page content'
                    selectedId={selectedPageContent}
                    setSelectedId={setSelectedPageContent}
                    tabsId='venue-page-content'
                    items={[
                        {
                            id: VenuePageContent.Publications,
                            content: 'Venue',
                        },
                        {
                            id: VenuePageContent.Volumes,
                            content: volumesTitle,
                        }
                    ]} />
            }

            {
                selectedPageContent === VenuePageContent.Publications && venue.publications &&
                <PageSection>
                    <header
                        className='mb-4 flex gap-3 items-center'>
                        <PageSectionTitle className='text-xl mb-0'>Venue Publications</PageSectionTitle>
                    </header>

                    <GroupedPublicationsList
                        publications={venue.publications}
                        defaultSelectedYears={defaultSelectedYears}
                        defaultSelectedTypes={defaultSelectedTypes}
                        defaultSelectedVenueIds={defaultSelectedVenueIds}
                        defaultSelectedAuthors={defaultSelectedAuthors} />
                </PageSection>
            }

            {
                selectedPageContent === VenuePageContent.Volumes &&
                <>
                    <VolumesSelection
                        title={volumesTitle}
                        toggleVolume={toggleVolume}
                        toggleVolumes={toggleVolumes}
                        wideItems={hasWideVolumeTitles}
                        selectedVolumeIds={selectedVolumeIds}
                        groups={venue.volumeGroups}
                        onFetchedVolume={onFetchedVolume} />

                    {
                        selectedVolumes.length > 0 &&
                        <VolumePublicationsSection
                            title={`Publications of Selected ${volumesTitle}`}
                            volumes={selectedVolumes}
                            defaultSelectedYears={defaultSelectedYears}
                            defaultSelectedTypes={defaultSelectedTypes}
                            defaultSelectedVenueIds={defaultSelectedVenueIds}
                            defaultSelectedAuthors={defaultSelectedAuthors} />
                    }
                </>
            }
        </>
    );
}