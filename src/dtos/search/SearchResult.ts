import { convertDblpUrlToLocalPath, createLocalSearchPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { RawBaseSearchResult, RawSearchCompletion, RawSearchHit, RawSearchResult } from './RawSearchResult'

/** Search result that was returned from dblp. */
export type SearchResult<HitT extends BaseSearchHit> = {
    readonly type: SearchType,
    readonly completions: {
        readonly total: number,
        readonly computed: number,
        readonly sent: number,
        readonly items: Array<SearchCompletion>
    },
    readonly hits: {
        readonly total: number,
        readonly computed: number,
        readonly sent: number,
        readonly first: number,
        readonly items: Array<{
            readonly score: number,
            readonly id: number,
            readonly info: HitT
        }>
    }
}

export type SearchCompletion = {
    readonly localUrl: string,
    readonly type: SearchType,
    readonly score: number,
    readonly dc: number,
    readonly oc: number,
    readonly id: number,
    readonly text: string
}

export type BaseSearchHit = {
    readonly url: string,
    readonly localUrl: string
}

export type AuthorSearchHit = BaseSearchHit & {
    readonly author: string,
    readonly aliases?: { allias: string }
    readonly notes?: { note: Array<AuthorSearchHitNote> | AuthorSearchHitNote }
}

export type AuthorSearchHitNote = {
    readonly '@type': string,
    readonly text: string
}

export type VenueSearchHit = BaseSearchHit & {
    readonly venue: string,
    readonly acronym: string,
    readonly type: string
}

/** Converts a raw search result that was returned from dblp to a more usable object. */
export function createSearchResultFromRaw<HitT extends BaseSearchHit>(
    rawResult: RawBaseSearchResult,
    type: SearchType
): SearchResult<HitT> {
    const result = rawResult.result;

    return {
        type: type,
        completions: {
            total: parseInt(result.completions['@total']),
            computed: parseInt(result.completions['@computed']),
            sent: parseInt(result.completions['@sent']),
            items: getCompletions(rawResult, type)
        },
        hits: {
            total: parseInt(result.hits['@total']),
            computed: parseInt(result.hits['@computed']),
            sent: parseInt(result.hits['@sent']),
            first: parseInt(result.hits['@first']),
            items: 'hit' in result.hits ? (rawResult as RawSearchResult<RawSearchHit>).result.hits.hit.map(h => {
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
        }
    };
}

/** Returns notes of an author. */
export function getAuthorsNotes(author: AuthorSearchHit) {
    if (!author.notes || !author.notes?.note) {
        return [];
    }

    if ('text' in author.notes.note) {
        const note = author.notes?.note as AuthorSearchHitNote;
        if (note) {
            return [note];
        }
    }
    else {
        const notes = author.notes?.note as Array<AuthorSearchHitNote>;
        return notes;
    }

    return [];
}

/** Returns all search completions from a raw search result. */
function getCompletions<HitT>(rawResult: RawBaseSearchResult, type: SearchType): Array<SearchCompletion> {
    const result = rawResult.result;

    if ('c' in result.completions) {
        const resultWithHits = rawResult as RawSearchResult<HitT>;

        if ('text' in resultWithHits.result.completions.c) {
            const completion = resultWithHits.result.completions.c as RawSearchCompletion;

            return [toCompletion(completion, type)];
        }

        const completions = resultWithHits.result.completions.c as Array<RawSearchCompletion>;

        return completions.map(c => toCompletion(c, type));
    }

    return [];
}

function toCompletion(rawCompletion: RawSearchCompletion, type: SearchType): SearchCompletion {
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