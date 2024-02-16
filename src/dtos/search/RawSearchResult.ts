/** Raw JSON search result that was returned from dblp. */
export type RawBaseSearchResult = {
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

/** Raw JSON search result that was returned from dblp. */
export type RawSearchResult<HitT> = RawBaseSearchResult & {
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
            c: Array<RawSearchCompletion> | RawSearchCompletion
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

export type RawSearchCompletion = {
    '@sc': string,
    '@dc': string,
    '@oc': string,
    '@id': string,
    text: string
}

export type RawSearchHit = {
    url: string
}