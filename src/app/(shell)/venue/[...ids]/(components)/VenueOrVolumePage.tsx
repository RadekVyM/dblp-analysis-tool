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
import AddToRecentlySeen from './AddToRecentlySeen'
import SaveButtons from './SaveButtons'
import VolumesContent from './VolumesContent'
import VolumesPageContent from './VolumesPageContent'

type VenueOrVolumePageParams = {
    venueOrVolume: DblpVenueBase,
    venueType: VenueType | null,
    venueId: string,
    volumeId?: string,
}

export default async function VenueOrVolumePage({ venueOrVolume, venueType, venueId, volumeId }: VenueOrVolumePageParams) {
    const isAuthorized = await isAuthorizedOnServer();

    return (
        <PageContainer>
            {
                isAuthorized && venueType !== VenueType.Book &&
                <AddToRecentlySeen
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
                    isAuthorized &&
                    <SaveButtons
                        title={venueOrVolume.title}
                        venueId={venueOrVolume.id} />
                }
            </header>

            {
                venueOrVolume.venueVolumeType === 'Volume' ?
                    <VolumesContent
                        volumes={[venueOrVolume as DblpVenueVolume]}
                        venueId={venueId}
                        volumeId={volumeId} /> :
                    <VolumesPageContent
                        venue={venueOrVolume as DblpVenue}
                        venueId={venueId}
                        volumeId={volumeId} />
            }
        </PageContainer>
    )
}