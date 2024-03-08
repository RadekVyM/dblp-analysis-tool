import 'server-only'
import { PublicationType } from '@/enums/PublicationType'
import { DblpPublication, DblpPublicationPerson, createDblpPublication } from '@/dtos/DblpPublication'
import { convertDblpIdToNormalizedId, extractNormalizedIdFromDblpUrlPath } from '@/utils/urls'

/**
 * Extracts publications information from a XML string using Cheerio.
 * @param $ Cheerio object with a loaded XML string
 * @param groupElement Selected element in which the publications should be looked for
 * @param groupTitle Title of a group to which these publications belong
 * @param groupIndex Order of a group to which these publications belong
 * @returns List of all publications in the XML string
 */
export function extractPublicationsFromXml(
    $: cheerio.Root,
    groupElement?: cheerio.Element,
    groupTitle?: string,
    groupIndex?: number
): Array<DblpPublication> {
    const publications: Array<DblpPublication> = [];
    const selector = 'r > *';
    const children = groupElement ? $(groupElement).find(selector) : $(selector);

    children.each((index, el) => {
        const elem = $(el);
        const key = elem.attr('key') || '';

        if (!key || key.startsWith('dblpnote')) {
            // https://dblp.org/rec/dblpnote/ellipsis.html
            // https://dblp.org/rec/dblpnote/neverpublished.html
            return;
        }

        const title = elem.find('title').first().text();
        const booktitle = elem.find('booktitle').first().text();
        const year = elem.find('year').first().text();
        const month = elem.find('month').first().text();
        const ee = elem.find('ee').first().text();
        const pages = elem.find('pages').first().text();
        const journal = elem.find('journal').first().text();
        const series = elem.find('series').first().text();
        const seriesUrl = elem.find('series').first().attr('href');
        const volume = elem.find('volume').first().text();
        const number = elem.find('number').first().text();
        const url = elem.find('url').first().text();
        const publisher = elem.find('publisher').first().text();
        const date = elem.attr('mdate');
        const editors = getPeople($, elem.children('editor'));
        const authors = getPeople($, elem.children('author'));
        const isInformal = elem.attr('publtype') === 'informal';
        const isEncyclopedia = elem.attr('publtype') === 'encyclopedia';
        const tagName = elem.prop('tagName').toLowerCase();

        const type = determinePublicationType(tagName, editors, isEncyclopedia, isInformal);

        // Remove volume segment from the URL path
        const urlIndexOfHash = url?.indexOf('#');
        const venueUrl = !url ? undefined : (urlIndexOfHash < 0 ? url : url.slice(0, urlIndexOfHash));
        const venueIdFromUrl = venueUrl ? extractNormalizedIdFromDblpUrlPath(venueUrl) : null;

        const seriesVenueId = seriesUrl ? extractNormalizedIdFromDblpUrlPath(seriesUrl) || [null, null] : [null, null];
        const venueId = venueIdFromUrl ?
            venueIdFromUrl :
            seriesVenueId;

        publications.push(createDblpPublication(
            key,
            title.endsWith('.') ? title.slice(0, -1) : title,
            parseInt(year),
            date || new Date().toString(),
            type,
            groupTitle || null,
            groupIndex || null,
            month,
            ee,
            booktitle === '' ? undefined : booktitle,
            pages,
            journal,
            series,
            seriesVenueId[0] ? seriesVenueId[0] : undefined,
            volume,
            number,
            venueId[0] ? venueId[0] : undefined,
            venueId[1] ? venueId[1] : undefined,
            publisher,
            authors,
            editors,
        ));
    });

    return publications;
}

/** Determines the publication type based on the retrieved information. */
function determinePublicationType(tagName: any, editors: DblpPublicationPerson[], isEncyclopedia: boolean, isInformal: boolean) {
    if (editors.length > 0 || tagName === 'proceedings')
        return PublicationType.Editorship;
    else if (tagName === 'incollection')
        return isEncyclopedia ?
            PublicationType.ReferenceWorks :
            PublicationType.PartsInBooksOrCollections;
    else if (tagName === 'article' && !isInformal)
        return PublicationType.JournalArticles;
    else if (tagName === 'data' && !isInformal)
        return PublicationType.DataAndArtifacts;
    else if (tagName === 'inproceedings')
        return PublicationType.ConferenceAndWorkshopPapers;
    else if (tagName === 'book' || tagName.includes('thesis'))
        return PublicationType.BooksAndTheses;

    return PublicationType.InformalAndOther;
}

/** Gets a list of all people found in the passed elements. */
function getPeople($: cheerio.Root, children: cheerio.Cheerio) {
    return (children
        .map((index, el) => {
            const elem = $(el);
            const pid = elem.attr('pid');
            const orcid = elem.attr('orcid');
            const name = elem.text();
            const [id, _] = convertDblpIdToNormalizedId(`pid/${pid}`) || [null, null];

            return {
                id: id,
                url: `/author/${id}`,
                name: name,
                orcid: orcid
            }
        })
        .get() as Array<DblpPublicationPerson>) || [];
}