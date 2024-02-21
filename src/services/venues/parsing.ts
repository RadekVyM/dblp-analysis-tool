import 'server-only'
import { VenueType } from '@/enums/VenueType'
import { SimpleSearchResultItem } from '@/dtos/search/SimpleSearchResult'
import * as cheerio from 'cheerio'
import { convertDblpUrlToLocalPath, getVenueTypeFromDblpString } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { isNumber } from '@/utils/strings'
import { DBLP_CONF_INDEX_ELEMENT_ID, DBLP_JOURNALS_INDEX_ELEMENT_ID, DBLP_SERIES_INDEX_ELEMENT_ID } from '@/constants/html'
import { DblpVenue, createDblpVenue } from '@/dtos/DblpVenue'
import he from 'he'
import { VENUES_COUNT_PER_DBLP_INDEX_PAGE } from '@/constants/search'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import { DblpVenuevolume, createDblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { extractPublicationsFromXml } from '../publications/parsing'

const DBLP_INDEX_ELEMENT_IDS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_ELEMENT_ID,
    [VenueType.Conference]: DBLP_CONF_INDEX_ELEMENT_ID,
    [VenueType.Series]: DBLP_SERIES_INDEX_ELEMENT_ID,
} as const

/**
 * Extracts all the venue or venue volume information from a XML string using Cheerio.
 * Some venues are not divided into multiple volumes.
 * These venues are perceived by this app as if they are volumes.
 * 
 * @param xml XML string
 * @param id Normalized ID of the venue
 * @returns Object containing all the venue information
 */
export function extractVenueOrVolume(xml: string, id: string, additionalVolumeId?: string): DblpVenueBase {
    const $ = cheerio.load(xml, { xmlMode: true });

    const title = $('h1').text();
    const key = $('bht').attr('key');
    const venueType = key ? getVenueTypeFromDblpString(key) || undefined : undefined;

    if ($('dblpcites').length > 0) {
        return extractVenueVolume($, title, venueType, id, additionalVolumeId);
    }
    else {
        return extractVenue($, title, venueType, id);
    }
}

/**
 * Extracts all the items from a part of the venues index HTML page.
 * @param html HTML string
 * @param type Venue type
 * @param count Max number of returned items
 * @returns List of found venues
 */
export function extractVenuesIndex(html: string, type: VenueType, count?: number) {
    const $ = cheerio.load(html);
    const links = $(`#${DBLP_INDEX_ELEMENT_IDS[type]} ul li a`);

    let authors: Array<SimpleSearchResultItem> = [];

    links.each((index, element) => {
        const link = $(element);
        const title = link.text();
        const href = link.attr('href');

        authors.push({
            title: he.decode(title),
            localUrl: href ? convertDblpUrlToLocalPath(href, SearchType.Venue) || '#' : '#'
        });
    });

    if (count) {
        authors = authors.slice(0, count);
    }

    return authors;
}

/**
 * Extracts the venues index length from the last index HTML page.
 * @param html HTML string
 * @param type Venue type
 * @returns The venues index length
 */
export function extractVenuesIndexLength(html: string, type: VenueType) {
    const id = DBLP_INDEX_ELEMENT_IDS[type];
    const $ = cheerio.load(html);
    const links = $(`#${id} ul li a`);
    const prevLink = $(`#${id} p a[href^="?pos="]:not(.disabled)`).first();
    const href = prevLink.attr('href');

    if (!href) {
        return links.length;
    }

    const previousPageFirstItemPosition = href.replace('?pos=', '');

    if (!isNumber(previousPageFirstItemPosition)) {
        return links.length;
    }

    const count = parseInt(previousPageFirstItemPosition) - 1 + VENUES_COUNT_PER_DBLP_INDEX_PAGE + links.length;
    return count;
}

function extractVenue($: cheerio.Root, title: string, venueType: VenueType | undefined, id: string): DblpVenue {
    const venue = createDblpVenue(
        id,
        he.decode(title),
        venueType
    );

    return venue;
}

function extractVenueVolume($: cheerio.Root, title: string, venueType: VenueType | undefined, id: string, additionalVolumeId?: string): DblpVenuevolume {
    const publications = extractPublicationsFromXml($);

    const volume = createDblpVenueVolume(
        additionalVolumeId ? additionalVolumeId : id,
        id,
        he.decode(title),
        publications,
        venueType
    );

    return volume;
}