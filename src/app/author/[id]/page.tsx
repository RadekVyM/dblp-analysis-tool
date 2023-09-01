import PageContainer from '@/app/(components)/PageContainer'
import PageTitle from '@/app/(components)/PageTitle'
import { fetchAuthor } from '@/server/fetching/authors'
import AddToRecentlySeen from './(components)/AddToRecentlySeen'
import LinksList from './(components)/LinksList'
import { DblpAuthorInfo } from '@/shared/models/DblpAuthor'
import Button from '@/app/(components)/Button'
import { MdBookmarks } from 'react-icons/md'
import Bookmarks from './(components)/Bookmarks'
import { cn } from '@/shared/utils/tailwindUtils'

type AuthorPageParams = {
    params: {
        id: string
    },
    searchParams: any
}

type AuthorInfoParams = {
    className?: string,
    info: DblpAuthorInfo,
    authorId: string,
    authorName: string
}

export default async function AuthorPage({ params: { id }, searchParams }: AuthorPageParams) {
    const author = await fetchAuthor(id);

    return (
        <PageContainer>
            <AddToRecentlySeen
                id={id}
                title={author.name} />
            <PageTitle
                title={author.name}
                subtitle='Author'
                className='pb-3' />

            {
                author.info &&
                <AuthorInfo
                    className='mb-6'
                    info={author.info}
                    authorId={author.id}
                    authorName={author.name} />
            }

            <p className='w-[fit-content] relative place-self-center'>Hello Author {id} page!</p>
            <ul className='w-[fit-content] relative place-self-center'>
                {Object.entries(searchParams)
                    .map(([key, value]) => {
                        return <li>{key}: {value as String}</li>;
                    })}
            </ul>
        </PageContainer>
    )
}

function AuthorInfo({ className, info, authorId, authorName }: AuthorInfoParams) {
    return (
        <div className={cn('flex flex-col gap-7', info.affiliations.length > 0 ? '' : 'mt-4', className)}>
            {
                info.affiliations.length > 0 &&
                <div>
                    <dl className='flex gap-2'><dt className='font-semibold'>Alias: </dt><dd>{info.aliases.join(' / ')}</dd></dl>
                    <ul>
                        {info.affiliations.map((affiliation) =>
                            <li
                                className='text-sm'>
                                {affiliation}
                            </li>)}
                    </ul>
                </div>
            }

            {
                info.links.length > 0 &&
                <LinksList
                    links={info.links} />
            }

            <Bookmarks
                className={cn(info.awards.length > 0 ? 'mb-1' : '')}
                authorId={authorId}
                title={authorName} />

            {
                info.awards.length > 0 &&
                <div>
                    <h3 className='mb-2 font-semibold'>Awards:</h3>
                    <ul className='flex flex-col gap-2'>
                        {info.awards.map((award) =>
                            <li
                                className='text-sm list-disc marker:text-primary list-inside'>
                                {award.title}
                            </li>)}
                    </ul>
                </div>
            }
        </div>
    )
}