import { DblpPublication } from '@/dtos/DblpPublication'
import { ExternalLink } from './ExternalLink'
import { convertToExternalLinks } from '@/utils/links'

/** Author stored in dblp. */
export type DblpAuthor = {
    readonly id: string,
    readonly name: string,
    readonly info?: DblpAuthorInfo,
    readonly homonyms: Array<DblpAuthorHomonym>,
    readonly publications: Array<DblpPublication>
}

/** Homonym of an author stored in dblp. */
export type DblpAuthorHomonym = {
    url: string,
    info: DblpAuthorInfo
}

/** Additional information of an author stored in dblp. */
export type DblpAuthorInfo = {
    readonly disambiguation: boolean,
    readonly mdate: Date,
    readonly aliases: Array<{ title: string, id?: string }>,
    readonly affiliations: Array<string>,
    readonly awards: Array<{ title: string, label: string }>,
    readonly links: Array<ExternalLink>
}

/** Creates an object of an author stored in dblp. */
export function createDblpAuthor(
    id: string,
    name: string,
    info?: DblpAuthorInfo,
    homonyms?: Array<DblpAuthorHomonym>,
    publications?: Array<DblpPublication>
): DblpAuthor {
    return {
        id,
        name,
        info,
        publications: publications || [],
        homonyms: homonyms || []
    }
}

/** Creates an object of some additional information of an author stored in dblp. */
export function createDblpAuthorInfo(
    disambiguation: boolean,
    mdate: string,
    info: {
        aliases?: Array<{ title: string, id?: string }>,
        affiliations?: Array<string>,
        awards?: Array<{ title: string, label: string }>,
        links?: Array<string>
    }
): DblpAuthorInfo {
    return {
        disambiguation,
        mdate: new Date(mdate),
        aliases: info.aliases || [],
        affiliations: info.affiliations || [],
        awards: info.awards || [],
        links: info.links ? convertToExternalLinks(info.links) : []
    }
}