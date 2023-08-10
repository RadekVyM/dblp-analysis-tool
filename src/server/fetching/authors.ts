'use server'

import { BaseItemsParams, DBLP_AUTHORS_INDEX_HTML, DBLP_URL } from '@/shared/fetching/fetching'
import { fetchItemsHtml } from '@/shared/fetching/items'

export async function fetchAuthors(params: BaseItemsParams) {
    const html = await fetchItemsHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);
}