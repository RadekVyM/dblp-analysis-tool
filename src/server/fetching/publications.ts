import { PublicationType } from '@/shared/enums/PublicationType'
import { DblpPublication, DblpPublicationPerson, createDblpPublication } from '@/shared/models/DblpPublication'
import { convertDblpIdToNormalizedId } from '@/shared/utils/urls'

export function extractPublicationsFromXml($: cheerio.Root) {
    const publications: Array<DblpPublication> = [];

    $('r > *').each((index, el) => {
        const elem = $(el);
        const title = elem.find('title').first().text();
        const booktitle = elem.find('booktitle').first().text();
        const year = elem.find('year').first().text();
        const ee = elem.find('ee').first().text();
        const key = elem.attr('key') || '';
        const date = elem.attr('mdate');
        const editors = getPeople($, elem.children('editor'));
        const authors = getPeople($, elem.children('author'));
        const informal = elem.attr('publtype') == 'informal';
        const encyclopedia = elem.attr('publtype') == 'encyclopedia';
        const tagName = elem.prop('tagName').toLowerCase();

        let type: PublicationType = PublicationType.InformalAndOther;

        if (editors.length > 0)
            type = PublicationType.Editorship;
        else if (tagName == 'incollection')
            type = encyclopedia ? PublicationType.ReferenceWorks : PublicationType.PartsInBooksOrCollections;
        else if (tagName == 'article' && !informal)
            type = PublicationType.JournalArticles;
        else if (tagName == 'data' && !informal)
            type = PublicationType.DataAndArtifacts;
        else if (tagName == 'inproceedings')
            type = PublicationType.ConferenceAndWorkshopPapers;
        else if (tagName == 'book')
            type = PublicationType.BooksAndTheses;

        publications.push(createDblpPublication(
            key,
            title,
            parseInt(year),
            date || new Date().toString(),
            type,
            ee,
            booktitle == '' ? undefined : booktitle,
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
            const id = convertDblpIdToNormalizedId(`pid/${pid}`);

            return {
                id: id,
                url: `/author/${id}`,
                name: name,
                orcid: orcid
            }
        })
        .get() as Array<DblpPublicationPerson>) || [];
}