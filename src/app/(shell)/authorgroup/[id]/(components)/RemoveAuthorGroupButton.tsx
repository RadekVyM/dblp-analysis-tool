'use client'

import Button from '@/components/Button'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import { useRouter } from 'next/navigation'

type RemoveAuthorGroupButtonParams = {
    authorGroupId: string
}

export function RemoveAuthorGroupButton({ authorGroupId }: RemoveAuthorGroupButtonParams) {
    const { removeAuthorGroup } = useAuthorGroups();
    const router = useRouter();

    async function remove() {
        await removeAuthorGroup(authorGroupId);
        router.push('/');
    }

    return (
        <Button
            onClick={remove}>
            Remove
        </Button>
    )
}