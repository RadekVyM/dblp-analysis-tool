export class DblpAuthor {
    public readonly info?: DblpAuthorInfo;

    constructor(
        public readonly id: string,
        public readonly name: string,
        info?: {
            date: string,
            aliases?: Array<string>,
            affiliations?: Array<string>,
            awards?: Array<{ title: string, label: string }>,
            links?: Array<string>
        }) {
            if (info) {
                this.info = {
                    date: new Date(info.date),
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
    }
}

export type DblpAuthorInfo = {
    date: Date,
    aliases: Array<string>,
    affiliations: Array<string>,
    awards: Array<{ title: string, label: string }>,
    links: Array<
        {
            url: string,
            title: string,
            icon: string
        }>,
}