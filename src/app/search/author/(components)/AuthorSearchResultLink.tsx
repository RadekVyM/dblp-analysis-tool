'use client'

import { SimpleSearchResultItem } from '@/shared/dtos/SimpleSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import { convertDblpUrlToLocalPath, createSearchPath } from '@/shared/utils/urls'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type AuthorSearchResultLinkParams = {
    author: SimpleSearchResultItem
}

export default function AuthorSearchResultLink({ author }: AuthorSearchResultLinkParams) {
    const useNormalLink = author.url.startsWith('/author');

    if (useNormalLink)
        return (
            <NormalLink
                author={author} />
        )
    else
        return (
            <ButtonLink
                author={author} />
        )
}

function NormalLink({ author }: AuthorSearchResultLinkParams) {
    return (
        <Link
            href={author.url}
            className='
                relative flex flex-col px-3 py-2 my-1 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition-colors
                hover:before:content-[""] hover:before:block hover:before:absolute hover:before:left-0 hover:before:top-1/2 hover:before:translate-y-[-50%]
                hover:before:bg-accent hover:before:w-1 hover:before:h-4 hover:before:rounded-sm'>
            {author.title}
            {
                author.additionalInfo &&
                <span
                    className='text-xs text-gray-500 pt-1'
                    dangerouslySetInnerHTML={{ __html: author.additionalInfo }} />
            }
        </Link>
    )
}

function ButtonLink({ author }: AuthorSearchResultLinkParams) {
    const router = useRouter();

    // TODO: This needs to be propetly tested
    async function onButtonClick() {
        const response = await fetch(author.url);
        let localUrl = createSearchPath(SearchType.Author, { q: author.title });

        if (response.status == 301) {
            const newDblpUrl = response.headers.get('Location');

            if (newDblpUrl) {
                const newLocalUrl = convertDblpUrlToLocalPath(newDblpUrl, SearchType.Author);

                if (newLocalUrl) {
                    localUrl = newLocalUrl;
                }
            }
        }

        if (response.status == 410) {
        }

        router.push(localUrl);
    }

    return (
        <button
            onClick={async () => await onButtonClick()}
            className='
                relative flex px-3 py-2 my-1 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition-colors
                hover:before:content-[""] hover:before:block hover:before:absolute hover:before:left-0 hover:before:top-1/2 hover:before:translate-y-[-50%]
                hover:before:bg-accent hover:before:w-1 hover:before:h-4 hover:before:rounded-sm'>
            {author.title}
        </button>
    )
}