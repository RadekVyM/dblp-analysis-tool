'use client'

import { DblpVenue } from '@/dtos/DblpVenue'
import VolumesStats from './VolumesStats'
import VolumesSelection from './VolumesSelection'
import useSelectableFetchableVenueVolumes from '@/hooks/venues/useSelectableFetchableVenueVolumes'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { PageSection, PageSectionTitle, PageSubsectionTitle } from '@/components/shell/PageSection'
import DividedDefinitionList, { DefinitionListItem } from '@/components/DividedDefinitionList'
import PublicationsOverTimeStats from '@/components/data-visualisation/stats/PublicationsOverTimeStats'
import VenueTopAuthorsStats from '@/components/data-visualisation/stats/VenueTopAuthorsStats'
import { cn } from '@/utils/tailwindUtils'
import { useMemo, useState } from 'react'
import ExportVenueButton from './ExportVenueButton'
import VenueContent from './VenueContent'
import Tabs from '@/components/Tabs'
import { VenuePageContent } from '@/enums/VenuePageContent'
import useVenueVolumes from '@/hooks/venues/useVenueVolumesTitle'

type MultipleVolumesPageContentParams = {
    venue: DblpVenue,
    venueVolumeType: VenueVolumeType,
    venueId: string,
    volumeId?: string,
    defaultSelectedVolumeIds?: Array<string>,
}

type GeneralStatsSectionParams = {
    venue: DblpVenue
}

/**
 * Content that should be displayed on a venue page with multiple venue volumes.
 * This includes volumes selection and all the volumes statistics.
*/
export default function MultipleVolumesPageContent({ venue, venueVolumeType, venueId, volumeId, defaultSelectedVolumeIds }: MultipleVolumesPageContentParams) {
    const {
        selectedVolumes,
        selectedVolumeIds,
        toggleVolume,
        toggleVolumes,
        onFetchedVolume
    } = useSelectableFetchableVenueVolumes(venue.volumeGroups, defaultSelectedVolumeIds);
    const exportedObject = useMemo(() => ({
        venue: venue,
        selectedVolumes: selectedVolumes
    }), [venue, selectedVolumes]);
    const [selectedPageContent, setSelectedPageContent] = useState<VenuePageContent>(venue.publications ?
        VenuePageContent.Publications :
        VenuePageContent.Volumes);
    const { hasWideVolumeTitles, volumesTitle } = useVenueVolumes(venue);

    return (
        <>
            <GeneralStatsSection
                venue={venue} />

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
                <VenueContent
                    id='venue'
                    publications={venue.publications}
                    venueId={venueId} />
            }

            {
                selectedPageContent === VenuePageContent.Volumes &&
                <>
                    <VolumesSelection
                        title={volumesTitle}
                        wideItems={hasWideVolumeTitles}
                        toggleVolume={toggleVolume}
                        toggleVolumes={toggleVolumes}
                        selectedVolumeIds={selectedVolumeIds}
                        groups={venue.volumeGroups}
                        onFetchedVolume={onFetchedVolume} />

                    {
                        selectedVolumes.length > 0 &&
                        <VolumesStats
                            id='venue-volumes'
                            venueVolumeType={venueVolumeType}
                            volumes={selectedVolumes}
                            venueId={venueId}
                            volumeId={volumeId} />
                    }
                </>
            }

            <ExportVenueButton
                exportedObject={exportedObject}
                venueTitle={venue.title}
                disabled={!venue} />
        </>
    )
}

function GeneralStatsSection({ venue }: GeneralStatsSectionParams) {
    if (!venue.venueAuthorsInfo && !venue.venuePublicationsInfo) {
        return undefined;
    }

    const generalStatsItems: Array<DefinitionListItem> = [];

    if (venue.venueAuthorsInfo) {
        generalStatsItems.push({ term: 'Total authors count:', definition: venue.venueAuthorsInfo.totalAuthorsCount.toLocaleString(undefined, { useGrouping: true }) });
    }

    if (venue.venuePublicationsInfo) {
        generalStatsItems.push({ term: 'Total publications count:', definition: venue.venuePublicationsInfo.totalPublicationsCount.toLocaleString(undefined, { useGrouping: true }) });
    }

    return (
        <PageSection>
            <PageSectionTitle className='text-xl'>General Statistics</PageSectionTitle>

            <DividedDefinitionList
                className='mb-6'
                items={generalStatsItems} />

            {
                venue.venuePublicationsInfo &&
                <>
                    <PageSubsectionTitle>Records by Year</PageSubsectionTitle>
                    <PublicationsOverTimeStats
                        isSimplified
                        publications={venue.venuePublicationsInfo.yearlyPublications}
                        scaffoldId='general-venue-publications-stats'
                        className={cn(venue.venueAuthorsInfo ? 'mb-10' : '')} />
                </>
            }

            {
                venue.venueAuthorsInfo &&
                <>
                    <PageSubsectionTitle>Frequent Authors</PageSubsectionTitle>
                    <VenueTopAuthorsStats
                        authors={venue.venueAuthorsInfo.topAuthors}
                        totalPublicationsCount={venue.venuePublicationsInfo?.totalPublicationsCount || undefined}
                        scaffoldId='general-venue-publications-stats' />
                </>
            }
        </PageSection>
    )
}