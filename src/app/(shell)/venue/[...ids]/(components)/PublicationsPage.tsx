import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import VenuePublications from './VenuePublications'
import VolumePublications from './VolumePublications'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { DblpVenue } from '@/dtos/DblpVenue'

type PublicationsPageParams = {
    venueOrVolume: DblpVenueBase,
    venueId: string,
    volumeId?: string,
}

export default async function PublicationsPage({ venueOrVolume, venueId, volumeId }: PublicationsPageParams) {
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
                    <VolumePublications
                        volumes={[venueOrVolume as DblpVenueVolume]} /> :
                    <VenuePublications
                        venue={venueOrVolume as DblpVenue}
                        venueId={venueId}
                        volumeId={volumeId} />
            }

            <ScrollToTopButton />
        </PageContainer>
    )
}