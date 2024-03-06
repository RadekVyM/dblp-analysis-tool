import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { DblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { VenueType } from '@/enums/VenueType'
import { DblpVenue, getVenueTitleFromId } from '@/dtos/DblpVenue'
import LinksList from '@/components/LinksList'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import AddToVisitedVenues from './AddToVisitedVenues'
import SaveVenueButton from './SaveVenueButton'
import MultipleVolumesPageContent from './MultipleVolumesPageContent'
import VenueVolumePageContent from './VenueVolumePageContent'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'

type VenuePageParams = {
    venueOrVolume: DblpVenueBase,
    venueType: VenueType | null,
    venueId: string,
    volumeId?: string,
    defaultSelectedVolumeIds?: Array<string>,
}

/** Page displaying content of a venue. */
export default async function VenuePage({ venueOrVolume, venueType, venueId, volumeId, defaultSelectedVolumeIds }: VenuePageParams) {
    const displaySubtitle = venueOrVolume.venueVolumeType === 'Volume' &&
        volumeId &&
        (venueOrVolume as DblpVenueVolume).type !== VenueType.Book;
    const subtitle = displaySubtitle ?
        ((venueOrVolume as DblpVenueVolume).venueTitle || getVenueTitleFromId((venueOrVolume as DblpVenueVolume).venueId)) :
        undefined;

    return (
        <PageContainer>
            {
                venueType !== VenueType.Book &&
                <AddToVisitedVenues
                    venueId={venueId}
                    volumeId={volumeId}
                    title={venueOrVolume.title} />
            }

            <header
                className='mb-12'>
                <PageTitle
                    title={venueOrVolume.title}
                    annotation={venueOrVolume.type ? VENUE_TYPE_TITLE[venueOrVolume.type] : undefined}
                    subtitle={subtitle}
                    subtitleHref={createLocalPath(venueId, SearchType.Venue)}
                    className='pb-3' />

                <LinksList
                    className={'mt-4 mb-7'}
                    links={venueOrVolume.links} />

                <div
                    className='flex gap-x-2'>
                    {
                        <SaveVenueButton
                            title={venueOrVolume.title}
                            venueId={venueId}
                            volumeId={volumeId} />
                    }
                    <div
                        id='export-venue-button-container'>
                    </div>
                </div>
            </header>

            {
                venueOrVolume.venueVolumeType === 'Volume' ?
                    <VenueVolumePageContent
                        venueVolume={venueOrVolume as DblpVenueVolume}
                        venueId={venueId}
                        volumeId={volumeId} /> :
                    <MultipleVolumesPageContent
                        venueVolumeType={venueOrVolume.venueVolumeType}
                        venue={venueOrVolume as DblpVenue}
                        venueId={venueId}
                        volumeId={volumeId}
                        defaultSelectedVolumeIds={defaultSelectedVolumeIds} />
            }
        </PageContainer>
    )
}