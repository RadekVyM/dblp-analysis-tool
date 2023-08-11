import { SimpleSearchResultItem } from '@/shared/dtos/SimpleSearchResult'
import Link from 'next/link'

type AuthorSearchResultLinkParams = {
    author: SimpleSearchResultItem
}

export default function AuthorSearchResultLink({ author }: AuthorSearchResultLinkParams) {
    return (
        <Link
            href={author.localUrl}
            className='
                relative flex flex-col px-3 py-2 my-1 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition-colors
                hover:before:content-[""] hover:before:block hover:before:absolute hover:before:left-0 hover:before:top-1/2 hover:before:translate-y-[-50%]
                hover:before:bg-accent hover:before:w-1 hover:before:h-4 hover:before:rounded-sm'>
            {author.title}
            {
                author.additionalInfo &&
                <small
                    className='text-xs text-gray-500 dark:text-gray-400 pt-1'
                    dangerouslySetInnerHTML={{ __html: author.additionalInfo }} />
            }
        </Link>
    )
}
