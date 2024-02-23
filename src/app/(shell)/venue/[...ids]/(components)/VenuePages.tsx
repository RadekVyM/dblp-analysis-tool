import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { isAuthorizedOnServer } from '@/services/auth'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { VenueType } from '@/enums/VenueType'
import { DblpVenue } from '@/dtos/DblpVenue'
import LinksList from '@/components/LinksList'
import { cn } from '@/utils/tailwindUtils'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import AddToVisitedVenues from './AddToVisitedVenues'
import SaveVenueButton from './SaveVenueButton'
import VolumesStats from './VolumesStats'
import MultipleVolumesPageContent from './MultipleVolumesPageContent'

type VenuePageParams = {
    venueOrVolume: DblpVenueBase,
    venueType: VenueType | null,
    venueId: string,
    volumeId?: string,
}

/** Page displaying content of a venue. */
export default async function VenuePage({ venueOrVolume, venueType, venueId, volumeId }: VenuePageParams) {
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <PageContainer>
            {
                isAuthorized && venueType !== VenueType.Book &&
                <AddToVisitedVenues
                    id={venueId}
                    title={venueOrVolume.title} />
            }

            <header
                className='mb-12'>
                <PageTitle
                    title={venueOrVolume.title}
                    subtitle={venueOrVolume.type ? VENUE_TYPE_TITLE[venueOrVolume.type] : undefined}
                    className='pb-3' />

                <LinksList
                    className={cn('mt-4', isAuthorized ? 'mb-7' : '')}
                    links={venueOrVolume.links} />

                {
                    isAuthorized && venueType !== VenueType.Book &&
                    <SaveVenueButton
                        title={venueOrVolume.title}
                        venueId={venueOrVolume.id} />
                }
            </header>

            {
                venueOrVolume.venueVolumeType === 'Volume' ?
                    <VolumesStats
                        venueVolumeType={venueOrVolume.venueVolumeType}
                        volumes={[venueOrVolume as DblpVenueVolume]}
                        venueId={venueId}
                        volumeId={volumeId} /> :
                    <MultipleVolumesPageContent
                        venueVolumeType={venueOrVolume.venueVolumeType}
                        venue={venueOrVolume as DblpVenue}
                        venueId={venueId}
                        volumeId={volumeId} />
            }
        </PageContainer>
    )
}