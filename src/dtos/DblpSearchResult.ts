export interface RawDblpCompletion {
    "@sc": string,
    "@dc": string,
    "@oc": string,
    "@id": string,
    text: string
}

export interface DblpCompletion {
    score: number,
    dc: number,
    oc: number,
    id: number,
    text: string
}

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

export class DblpSearchResult<HitT> {
    public readonly query: string;
    public readonly status: {
        code: number,
        text: string
    };
    public readonly time: {
        unit: string,
        value: number
    };
    public readonly completions: {
        total: number,
        computed: number,
        sent: number,
        items: Array<DblpCompletion>
    };
    public readonly hits: {
        total: number,
        computed: number,
        sent: number,
        first: number,
        items: Array<{
            score: number,
            id: number,
            info: HitT
        }>
    };

    constructor(rawResult: RawDblpBaseSearchResult) {
        const result = rawResult.result;

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
            items: getCompletions(rawResult)
        };
        this.hits = {
            total: parseInt(result.hits["@total"]),
            computed: parseInt(result.hits["@computed"]),
            sent: parseInt(result.hits["@sent"]),
            first: parseInt(result.hits["@first"]),
            items: 'hit' in result.hits ? (rawResult as RawDblpSearchResult<HitT>).result.hits.hit.map(h => {
                return {
                    score: parseInt(h["@score"]),
                    id: parseInt(h["@id"]),
                    info: h.info
                }
            }) : []
        };
    }
}

export interface AuthorHit {
    author: string,
    url: string
}

export interface VenueHit {
    venue: string,
    acronym: string,
    type: string,
    url: string
}

function getCompletions<HitT>(rawResult: RawDblpBaseSearchResult): Array<DblpCompletion> {
    const result = rawResult.result;

    if ('c' in result.completions) {
        const resultWithHits = rawResult as RawDblpSearchResult<HitT>;

        if (typeof resultWithHits.result.completions.c == typeof Array<RawDblpCompletion>) {
            const completions = resultWithHits.result.completions.c as Array<RawDblpCompletion>;

            return completions.map(c => toCompletion(c));
        }

        return [toCompletion(resultWithHits.result.completions.c as RawDblpCompletion)];
    }

    return [];
}

function toCompletion(rawCompletion: RawDblpCompletion): DblpCompletion {
    return {
        score: parseInt(rawCompletion["@sc"]),
        dc: parseInt(rawCompletion["@dc"]),
        oc: parseInt(rawCompletion["@oc"]),
        id: parseInt(rawCompletion["@id"]),
        text: rawCompletion.text
    }
}