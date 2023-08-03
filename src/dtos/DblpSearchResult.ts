import { createLocalUrl, createSearchUrl, extractNormalizedId } from "@/utils/urls"
import { DbplSearchType } from "./DbplSearchType"

export interface RawDblpBaseSearchResult {
    result: {
        query: string,
        status: {
            "@code": string
            text: string
        },
        time: {
            "@unit": string,
            text: string
        },
        completions: {
            "@total": string,
            "@computed": string,
            "@sent": string
        },
        hits: {
            "@total": string,
            "@computed": string,
            "@sent": string,
            "@first": string
        }
    }
}

export interface RawDblpSearchResult<HitT> extends RawDblpBaseSearchResult {
    result: {
        query: string,
        status: {
            "@code": string
            text: string
        },
        time: {
            "@unit": string,
            text: string
        },
        completions: {
            "@total": string,
            "@computed": string,
            "@sent": string,
            c: Array<RawDblpCompletion> | RawDblpCompletion
        },
        hits: {
            "@total": string,
            "@computed": string,
            "@sent": string,
            "@first": string,
            hit: Array<{
                "@score": string,
                "@id": string,
                info: HitT
            }>
        }
    }
}

export interface RawDblpCompletion {
    "@sc": string,
    "@dc": string,
    "@oc": string,
    "@id": string,
    text: string
}

export interface RawBaseHit {
    url: string
}

export class DblpSearchResult<HitT extends BaseDblpSearchHit> {
    public readonly type: DbplSearchType;
    public readonly query: string;
    public readonly status: {
        readonly code: number,
        readonly text: string
    };
    public readonly time: {
        readonly unit: string,
        readonly value: number
    };
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

    constructor(rawResult: RawDblpBaseSearchResult, type: DbplSearchType) {
        const result = rawResult.result;

        this.type = type;
        this.query = result.query;
        this.status = {
            code: parseInt(result.status["@code"]),
            text: result.status.text
        };
        this.time = {
            unit: result.time["@unit"],
            value: parseFloat(result.time.text)
        };
        this.completions = {
            total: parseInt(result.completions["@total"]),
            computed: parseInt(result.completions["@computed"]),
            sent: parseInt(result.completions["@sent"]),
            items: getCompletions(rawResult, type)
        };
        this.hits = {
            total: parseInt(result.hits["@total"]),
            computed: parseInt(result.hits["@computed"]),
            sent: parseInt(result.hits["@sent"]),
            first: parseInt(result.hits["@first"]),
            items: 'hit' in result.hits ? (rawResult as RawDblpSearchResult<RawBaseHit>).result.hits.hit.map(h => {
                return {
                    score: parseInt(h["@score"]),
                    id: parseInt(h["@id"]),
                    info: {
                        ...h.info,
                        url: h.info.url,
                        localUrl: createLocalUrl(h.info.url, type)
                    } as HitT
                }
            }) : []
        };
    }
}

export interface DblpCompletion {
    readonly localUrl: string,
    readonly type: DbplSearchType,
    readonly score: number,
    readonly dc: number,
    readonly oc: number,
    readonly id: number,
    readonly text: string
}

export interface BaseDblpSearchHit {
    readonly url: string,
    readonly localUrl: string
}

export interface DblpAuthorSearchHit extends BaseDblpSearchHit {
    readonly author: string
}

export interface DblpVenueSearchHit extends BaseDblpSearchHit {
    readonly venue: string,
    readonly acronym: string,
    readonly type: string
}


function getCompletions<HitT>(rawResult: RawDblpBaseSearchResult, type: DbplSearchType): Array<DblpCompletion> {
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

function toCompletion(rawCompletion: RawDblpCompletion, type: DbplSearchType): DblpCompletion {
    return {
        score: parseInt(rawCompletion["@sc"]),
        dc: parseInt(rawCompletion["@dc"]),
        oc: parseInt(rawCompletion["@oc"]),
        id: parseInt(rawCompletion["@id"]),
        text: rawCompletion.text,
        type: type,
        localUrl: createSearchUrl(rawCompletion.text, type)
    }
}