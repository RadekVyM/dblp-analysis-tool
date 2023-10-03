import { convertDblpUrlToLocalPath, createLocalSearchPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'

export type RawDblpBaseSearchResult = {
    result: {
        query: string,
        status: {
            '@code': string
            text: string
        },
        time: {
            '@unit': string,
            text: string
        },
        completions: {
            '@total': string,
            '@computed': string,
            '@sent': string
        },
        hits: {
            '@total': string,
            '@computed': string,
            '@sent': string,
            '@first': string
        }
    }
}

export type RawDblpSearchResult<HitT> = RawDblpBaseSearchResult & {
    result: {
        query: string,
        status: {
            '@code': string
            text: string
        },
        time: {
            '@unit': string,
            text: string
        },
        completions: {
            '@total': string,
            '@computed': string,
            '@sent': string,
            c: Array<RawDblpCompletion> | RawDblpCompletion
        },
        hits: {
            '@total': string,
            '@computed': string,
            '@sent': string,
            '@first': string,
            hit: Array<{
                '@score': string,
                '@id': string,
                info: HitT
            }>
        }
    }
}

export type RawDblpCompletion = {
    '@sc': string,
    '@dc': string,
    '@oc': string,
    '@id': string,
    text: string
}

export type RawBaseHit = {
    url: string
}

export class DblpSearchResult<HitT extends BaseDblpSearchHit> {
    public readonly type: SearchType;
    public readonly completions: {
        readonly total: number,
        readonly computed: number,
        readonly sent: number,
        readonly items: Array<DblpCompletion>
    };
    public readonly hits: {
        readonly total: number,
        readonly computed: number,
        readonly sent: number,
        readonly first: number,
        readonly items: Array<{
            readonly score: number,
            readonly id: number,
            readonly info: HitT
        }>
    };

    constructor(rawResult: RawDblpBaseSearchResult, type: SearchType) {
        const result = rawResult.result;

        this.type = type;
        this.completions = {
            total: parseInt(result.completions['@total']),
            computed: parseInt(result.completions['@computed']),
            sent: parseInt(result.completions['@sent']),
            items: getCompletions(rawResult, type)
        };
        this.hits = {
            total: parseInt(result.hits['@total']),
            computed: parseInt(result.hits['@computed']),
            sent: parseInt(result.hits['@sent']),
            first: parseInt(result.hits['@first']),
            items: 'hit' in result.hits ? (rawResult as RawDblpSearchResult<RawBaseHit>).result.hits.hit.map(h => {
                return {
                    score: parseInt(h['@score']),
                    id: parseInt(h['@id']),
                    info: {
                        ...h.info,
                        url: h.info.url,
                        localUrl: convertDblpUrlToLocalPath(h.info.url, type)
                    } as HitT
                }
            }) : []
        };
    }
}

export type DblpCompletion = {
    readonly localUrl: string,
    readonly type: SearchType,
    readonly score: number,
    readonly dc: number,
    readonly oc: number,
    readonly id: number,
    readonly text: string
}

export type BaseDblpSearchHit = {
    readonly url: string,
    readonly localUrl: string
}

export type DblpAuthorSearchHit = BaseDblpSearchHit & {
    readonly author: string,
    readonly aliases?: { allias: string }
    readonly notes?: { note: Array<DblpAuthorSearchHitNote> | DblpAuthorSearchHitNote }
}

export type DblpAuthorSearchHitNote = {
    readonly '@type': string,
    readonly text: string
}

export type DblpVenueSearchHit = BaseDblpSearchHit & {
    readonly venue: string,
    readonly acronym: string,
    readonly type: string
}


export function getAuthorsNotes(author: DblpAuthorSearchHit) {
    if (!author.notes || !author.notes?.note) {
        return [];
    }

    if ('text' in author.notes.note) {
        const note = author.notes?.note as DblpAuthorSearchHitNote;
        if (note) {
            return [note];
        }
    }
    else {
        const notes = author.notes?.note as Array<DblpAuthorSearchHitNote>;
        return notes;
    }

    return [];
}

function getCompletions<HitT>(rawResult: RawDblpBaseSearchResult, type: SearchType): Array<DblpCompletion> {
    const result = rawResult.result;

    if ('c' in result.completions) {
        const resultWithHits = rawResult as RawDblpSearchResult<HitT>;

        if ('text' in resultWithHits.result.completions.c) {
            const completion = resultWithHits.result.completions.c as RawDblpCompletion;

            return [toCompletion(completion, type)];
        }

        const completions = resultWithHits.result.completions.c as Array<RawDblpCompletion>;

        return completions.map(c => toCompletion(c, type));
    }

    return [];
}

function toCompletion(rawCompletion: RawDblpCompletion, type: SearchType): DblpCompletion {
    return {
        score: parseInt(rawCompletion['@sc']),
        dc: parseInt(rawCompletion['@dc']),
        oc: parseInt(rawCompletion['@oc']),
        id: parseInt(rawCompletion['@id']),
        text: rawCompletion.text,
        type: type,
        localUrl: createLocalSearchPath(type, { query: rawCompletion.text })
    }
}