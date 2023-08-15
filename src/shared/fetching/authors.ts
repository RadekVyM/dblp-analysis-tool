import { RawDblpBaseSearchResult } from '../dtos/DblpSearchResult'
import { ItemsParams } from './shared'
import { queryItemsJson } from './items'
import { DBLP_SEARCH_AUTHOR_API, DBLP_URL } from '../constants/urls'

export interface AuthorsParams extends ItemsParams {
}

export async function queryAuthors(params: AuthorsParams) {
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params).then(data => data as RawDblpBaseSearchResult);
}