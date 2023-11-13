import ListLink from '@/components/ListLink'
import PageContainer from '@/components/shell/PageContainer'
import PageTitle from '@/components/shell/PageTitle'
import { SearchType } from '@/enums/SearchType'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { getAuthorGroup } from '@/services/saves/authorGroups'
import { createLocalPath } from '@/utils/urls'
import { redirect } from 'next/navigation'
import { RemoveAuthorGroupButton } from './(components)/RemoveAuthorGroupButton'
import { unauthorized } from '@/utils/errors'

type AuthorGroupPageParams = {
    params: {
        id: string
    }
}

export default async function AuthorGroupPage({ params: { id } }: AuthorGroupPageParams) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    const authorGroup = await getAuthorGroup(id, user);

    if (!authorGroup) {
        throw unauthorized('You cannot access this author group.');
    }

    return (
        <PageContainer>
            <header>
                <PageTitle
                    title={authorGroup.title}
                    subtitle='Author group'
                    className='pb-3' />
                <RemoveAuthorGroupButton
                    authorGroupId={authorGroup.id} />
            </header>

            <ul>
                {authorGroup.authors.map((author) =>
                    <li
                        key={author.id}>
                        <ListLink
                            href={createLocalPath(author.id, SearchType.Author)}>
                            {author.title}
                        </ListLink>
                    </li>)}
            </ul>
        </PageContainer>
    )
} 