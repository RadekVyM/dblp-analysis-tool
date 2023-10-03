import { DblpPublication } from '@/models/DblpPublication'

export type DblpAuthor = {
    readonly id: string,
    readonly name: string,
    readonly info?: DblpAuthorInfo,
    readonly homonyms: Array<DblpAuthorHomonym>,
    readonly publications: Array<DblpPublication>
}

export type DblpAuthorHomonym = {
    url: string,
    info: DblpAuthorInfo
}

export type DblpAuthorInfo = {
    readonly disambiguation: boolean,
    readonly date: Date,
    readonly aliases: Array<{ title: string, id?: string }>,
    readonly affiliations: Array<string>,
    readonly awards: Array<{ title: string, label: string }>,
    readonly links: Array<
        {
            url: string,
            title: string,
            icon: string
        }>
}

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

export function createDblpAuthorInfo(
    disambiguation: boolean,
    date: string,
    info: {
        aliases?: Array<{ title: string, id?: string }>,
        affiliations?: Array<string>,
        awards?: Array<{ title: string, label: string }>,
        links?: Array<string> 
    }
): DblpAuthorInfo {
    return {
        disambiguation,
        date: new Date(date),
        aliases: info.aliases || [],
        affiliations: info.affiliations || [],
        awards: info.awards || [],
        links: info.links?.map((link) => {
            const url = new URL(link);
            
            return {
                url: link,
                title: url.hostname,
                icon: `https://www.google.com/s2/favicons?domain=${url.hostname.split('.').slice(-2).join('.')}&sz=16`
            }
        }) || []
    }
}