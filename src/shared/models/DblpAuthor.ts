import { DblpPublication } from './DblpPublication'

export class DblpAuthor {
    public readonly homonyms: Array<DblpAuthorHomonym>;
    public readonly publications: Array<DblpPublication>;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly info?: DblpAuthorInfo,
        homonyms?: Array<DblpAuthorHomonym>,
        publications?: Array<DblpPublication>) {
        this.publications = publications || [];
        this.homonyms = homonyms || [];
    }
}

export type DblpAuthorHomonym = {
    url: string,
    info: DblpAuthorInfo
}

export class DblpAuthorInfo {
    public readonly date: Date;
    public readonly aliases: Array<{ title: string, id?: string }>;
    public readonly affiliations: Array<string>;
    public readonly awards: Array<{ title: string, label: string }>;
    public readonly links: Array<
        {
            url: string,
            title: string,
            icon: string
        }>

    constructor(
        public readonly disambiguation: boolean,
        date: string,
        info: {
            aliases?: Array<{ title: string, id?: string }>,
            affiliations?: Array<string>,
            awards?: Array<{ title: string, label: string }>,
            links?: Array<string> 
        }
    ) {
        this.date = new Date(date),
        this.aliases = info.aliases || [],
        this.affiliations = info.affiliations || [],
        this.awards = info.awards || [],
        this.links = info.links?.map((link) => {
            const url = new URL(link);
            
            return {
                url: link,
                title: url.hostname,
                icon: `https://www.google.com/s2/favicons?domain=${url.hostname.split('.').slice(-2).join('.')}&sz=16`
            }
        }) || []
    }
}