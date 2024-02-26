import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import MultipleVolumesPublications from './MultipleVolumesPublications'
import VolumePublicationsSection from './VolumePublicationsSection'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenue } from '@/dtos/DblpVenue'

type VenuePublicationsPageParams = {
    venueOrVolume: DblpVenueBase,
    venueId: string,
    volumeId?: string,
    defaultSelectedYears?: Array<number>,
    defaultSelectedVolumeIds?: Array<string>,
}

/** Page displaying publications of a venue. */
export default async function VenuePublicationsPage({ venueOrVolume, venueId, volumeId, defaultSelectedYears, defaultSelectedVolumeIds }: VenuePublicationsPageParams) {
    return (
        <PageContainer>
            <header
                className='mb-12'>
                <PageTitle
                    title={venueOrVolume.title}
                    titleHref={volumeId ? `/venue/${venueId}/${volumeId}` : `/venue/${venueId}`}
                    subtitle={venueOrVolume.type ? VENUE_TYPE_TITLE[venueOrVolume.type] : undefined}
                    className='pb-3' />
            </header>

            {
                venueOrVolume.venueVolumeType === 'Volume' ?
                    <VolumePublicationsSection
                        volumes={[venueOrVolume as DblpVenueVolume]}
                        defaultSelectedYears={defaultSelectedYears} /> :
                    <MultipleVolumesPublications
                        venue={venueOrVolume as DblpVenue}
                        venueId={venueId}
                        volumeId={volumeId}
                        defaultSelectedYears={defaultSelectedYears}
                        defaultSelectedVolumeIds={defaultSelectedVolumeIds} />
            }

            <ScrollToTopButton />
        </PageContainer>
    )
}