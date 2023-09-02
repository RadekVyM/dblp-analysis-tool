import { PublicationType } from "../enums/PublicationType";

export class DblpPublication {
    public readonly date: Date;
    public readonly authors: Array<DblpPublicationPerson>;
    public readonly editors: Array<DblpPublicationPerson>;

    constructor(
        public readonly id: string,
        public readonly title: string,
        date: string,
        public readonly type: PublicationType,
        public readonly booktitle?: string,
        authors?: Array<DblpPublicationPerson>,
        editors?: Array<DblpPublicationPerson>) {
        this.date = new Date(date);
        this.authors = authors || [];
        this.editors = editors || [];
    }
}

export type DblpPublicationPerson = {
    id: string,
    url: string,
    name: string,
    orcid?: string
}