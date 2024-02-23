import 'server-only'
import { VenueType } from '@/enums/VenueType'
import { SimpleSearchResultItem } from '@/dtos/search/SimpleSearchResult'
import * as cheerio from 'cheerio'
import { convertDblpUrlToLocalPath, convertNormalizedIdToDblpPath, extractNormalizedIdFromDblpUrlPath, getVenueTypeFromDblpString } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { isNumber } from '@/utils/strings'
import { DBLP_CONF_INDEX_ELEMENT_ID, DBLP_JOURNALS_INDEX_ELEMENT_ID, DBLP_SERIES_INDEX_ELEMENT_ID } from '@/constants/html'
import { DblpVenue, createDblpVenue } from '@/dtos/DblpVenue'
import he from 'he'
import { VENUES_COUNT_PER_DBLP_INDEX_PAGE } from '@/constants/search'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import { DblpVenueVolume, createDblpVenueVolume } from '@/dtos/DblpVenueVolume'
import { extractPublicationsFromXml } from '../publications/parsing'
import { DblpVenueVolumeItem, createDblpVenueVolumeItem } from '@/dtos/DblpVenueVolumeItem'
import { DBLP_URL } from '@/constants/urls'
import { DblpVenueVolumeItemGroup, createDblpVenueVolumeItemGroup } from '@/dtos/DblpVenueVolumeItemGroup'
import { DblpVenueTopAuthor, createDblpVenueTopAuthor } from '@/dtos/DblpVenueTopAuthor'
import { DblpVenueYearlyPublicationsCount, craeteDblpVenueYearlyPublicationsCount } from '@/dtos/DblpVenuePublicationsInfo'

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
 * @param additionalVolumeId Normalized ID of the venue volume
 * @returns Object containing all the venue information
 */
export function extractVenueOrVolume(xml: string, id: string, additionalVolumeId?: string): DblpVenueBase {
    const $ = cheerio.load(xml, { xmlMode: true });

    const title = $('h1').text();
    const key = $('bht').attr('key');
    const venueType = key ? getVenueTypeFromDblpString(key) || undefined : undefined;

    if ($(elementsContainingVolumeRefsSelector(id)).length > 0) {
        return extractVenue($, title, venueType, id);
    }
    else {
        return extractVenueVolume($, title, venueType, id, additionalVolumeId);
    }
}

/**
 * Extracts additional venue authors information from a XML string using Cheerio.
 * This includes top authors and authors count.
 * @param xml XML string
 * @returns Object containing top authors and authors count
 */
export function extractVenueAuthorsInfo(xml: string): { topAuthors: Array<DblpVenueTopAuthor>, totalAuthorsCount: number } | null {
    const $ = cheerio.load(xml, { xmlMode: true });

    const totalAuthorsCount = $('completions').attr('total');

    if (!totalAuthorsCount || !isNumber(totalAuthorsCount)) {
        return null;
    }

    const authors: Array<DblpVenueTopAuthor> = [];

    $('completions c').each((index, c) => {
        const completion = $(c);
        const text = completion.text();
        const count = completion.attr('sc');

        if (text.includes('0no0coauthors') || !count || !isNumber(count)) {
            return;
        }

        authors.push(createDblpVenueTopAuthor(
            text.replace(':facet:author:', ''),
            parseInt(count)
        ));
    });

    return {
        topAuthors: authors,
        totalAuthorsCount: parseInt(totalAuthorsCount)
    };
}

/**
 * Extracts venue yearly publications count from an SVG string using Cheerio.
 * 
 * @param svg XML string
 * @returns Array containing the statistics
 */
export function extractVenueYearlyPublications(svg: string): Array<DblpVenueYearlyPublicationsCount> | null {
    const $ = cheerio.load(svg, { xmlMode: true });

    const map = new Map<number, number>();

    $('rect > title').each((index, t) => {
        const text = $(t).text();
        const splitText = text.split(':');

        if (splitText.length < 2 || !isNumber(splitText[0].trim()) || !isNumber(splitText[1].trim())) {
            return;
        }

        map.set(parseInt(splitText[0].trim()), parseInt(splitText[1].trim()));
    });

    if (map.size === 0) {
        return null;
    }

    return [...map].map(([year, count]) => craeteDblpVenueYearlyPublicationsCount(year, count));
}

/**
 * Extracts all the items from a part of the venues index HTML page.
 * @param html HTML string
 * @param type Venue type
 * @param count Max number of returned items
 * @returns List of found venues
 */
export function extractVenuesIndex(html: string, type: VenueType, count?: number) {
    if (type === VenueType.Book) {
        // Books index is not searchable
        return [];
    }

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
    if (type === VenueType.Book) {
        // Books index is not searchable
        return 0;
    }

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

/** Extracts all the venue information from a XML string using Cheerio. */
function extractVenue($: cheerio.Root, title: string, venueType: VenueType | undefined, id: string): DblpVenue {
    const volumeGroups: Array<DblpVenueVolumeItemGroup> = [];

    $(elementsContainingVolumeRefsSelector(id)).each((liIndex, li) => {
        let groupTitle: string | undefined = '';

        $(li).contents().first().each((index, child) => {
            if (child.type === 'text') {
                groupTitle = $(child).text().trim();
                if (groupTitle.endsWith(':')) {
                    groupTitle = groupTitle.substring(0, groupTitle.length - 1);
                }
            }
        });

        const volumes = extractVolumeItems($, li, id, venueType);

        if (!groupTitle) {
            groupTitle = volumes.length > 1 ?
                `${volumes[0].title} - ${volumes[volumes.length - 1].title}` :
                volumes[0].title;
        }

        if (volumes.length > 0) {
            volumeGroups.push(createDblpVenueVolumeItemGroup(
                volumes,
                groupTitle
            ));
        }
    });

    const venue = createDblpVenue(
        id,
        he.decode(title),
        volumeGroups,
        venueType,
        [`${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}`]
    );

    return venue;
}

/** Extracts all the venue volume items from a XML string using Cheerio. */
function extractVolumeItems($: cheerio.Root, li: cheerio.Element, id: string, venueType: VenueType | undefined) {
    const volumes: Array<DblpVenueVolumeItem> = [];

    $(volumeRefSelector(id), li).each((refIndex, ref) => {
        const refElement = $(ref);

        const textContent = refElement.text();
        const href = refElement.attr('href');

        if (!href) {
            return;
        }

        const ids = extractNormalizedIdFromDblpUrlPath(href);

        if (!ids || !ids[1]) {
            return;
        }

        volumes.push(createDblpVenueVolumeItem(
            ids[0],
            ids[1],
            textContent,
            venueType
        ));
    })

    return volumes;
}

/** Extracts all the venue volume information from a XML string using Cheerio. */
function extractVenueVolume($: cheerio.Root, title: string, venueType: VenueType | undefined, id: string, additionalVolumeId?: string): DblpVenueVolume {
    const publications = extractPublicationsFromXml($);

    const volume = createDblpVenueVolume(
        additionalVolumeId ? additionalVolumeId : id,
        id,
        he.decode(title),
        publications,
        venueType,
        [`${DBLP_URL}/db${convertNormalizedIdToDblpPath(id, additionalVolumeId)}`]
    );

    return volume;
}

/** Returns a selector of <ref> elements. */
function volumeRefSelector(venueId: string) {
    return `ref[href*="${convertNormalizedIdToDblpPath(venueId)}"]`;
}

/** Returns a selector of elements that contain <ref> elements. */
function elementsContainingVolumeRefsSelector(venueId: string) {
    const ref = volumeRefSelector(venueId);
    return `tr:has(${ref}), li:has(${ref})`;
}