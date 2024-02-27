import { PublicationType } from '@/enums/PublicationType'

export type DefaultSelectedPublicationsParams = {
    defaultSelectedYears?: Array<number>,
    defaultSelectedVenueIds?: Array<string | undefined>,
    defaultSelectedTypes?: Array<PublicationType>,
    defaultSelectedAuthors?: Array<string>,
}