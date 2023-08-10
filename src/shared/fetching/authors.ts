import { DBLP_SEARCH_AUTHOR_API, DBLP_URL, ItemsParams } from "./fetching";
import { fetchItems } from "./items";

interface AuthorsParams extends ItemsParams {
}

export async function fetchAuthors(params: AuthorsParams) {
    return fetchItems(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params);
}