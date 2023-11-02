import { PublicationType } from '@/enums/PublicationType'
import { DblpPublication, DblpPublicationPerson, createDblpPublication } from '@/dtos/DblpPublication'
import { convertDblpIdToNormalizedId, extractNormalizedIdFromDblpUrlPath } from '@/utils/urls'

export function extractPublicationsFromXml($: cheerio.Root) {
    const publications: Array<DblpPublication> = [];

    $('r > *').each((index, el) => {
        const elem = $(el);
        const title = elem.find('title').first().text();
        const booktitle = elem.find('booktitle').first().text();
        const year = elem.find('year').first().text();
        const month = elem.find('month').first().text();
        const ee = elem.find('ee').first().text();
        const pages = elem.find('pages').first().text();
        const journal = elem.find('journal').first().text();
        const volume = elem.find('volume').first().text();
        const number = elem.find('number').first().text();
        const url = elem.find('url').first().text();
        const key = elem.attr('key') || '';
        const date = elem.attr('mdate');
        const editors = getPeople($, elem.children('editor'));
        const authors = getPeople($, elem.children('author'));
        const informal = elem.attr('publtype') === 'informal';
        const encyclopedia = elem.attr('publtype') === 'encyclopedia';
        const tagName = elem.prop('tagName').toLowerCase();

        let type: PublicationType = PublicationType.InformalAndOther;

        if (editors.length > 0)
            type = PublicationType.Editorship;
        else if (tagName === 'incollection')
            type = encyclopedia ? PublicationType.ReferenceWorks : PublicationType.PartsInBooksOrCollections;
        else if (tagName === 'article' && !informal)
            type = PublicationType.JournalArticles;
        else if (tagName === 'data' && !informal)
            type = PublicationType.DataAndArtifacts;
        else if (tagName === 'inproceedings')
            type = PublicationType.ConferenceAndWorkshopPapers;
        else if (tagName === 'book')
            type = PublicationType.BooksAndTheses;

        // Remove volume segment from the URL path
        const urlIndexOfHash = url?.indexOf('#');
        const venueUrl = !url ? undefined : (urlIndexOfHash < 0 ? url : url.slice(0, urlIndexOfHash));

        publications.push(createDblpPublication(
            key,
            title.endsWith('.') ? title.slice(0, -1) : title,
            parseInt(year),
            date || new Date().toString(),
            type,
            month,
            ee,
            booktitle === '' ? undefined : booktitle,
            pages,
            journal,
            volume,
            number,
            venueUrl ? (extractNormalizedIdFromDblpUrlPath(venueUrl) || [null, null])[0] || undefined : undefined,
            authors,
            editors,
        ));
    });

    return publications;
}

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