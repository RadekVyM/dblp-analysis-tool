'use client'

import { AuthorGroup } from '@/dtos/SavedAuthors'
import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from './shared'

const authorGroupsFetcher: Fetcher<Array<AuthorGroup> | null, string> = (key) =>
    fetchJson(key);

export default function useAuthorGroups() {
    const { data, error: fetchError, isLoading } = useSWR('/api/save/authorgroup', authorGroupsFetcher);
    const { trigger: triggerGroupPost, error: postGroupError } = useSWRMutation('/api/save/authorgroup', sendPostRequest<Omit<AuthorGroup, 'id'> & { id?: string }, AuthorGroup>);
    const { trigger: triggerGroupDelete, error: deleteGroupError } = useSWRMutation('/api/save/authorgroup', sendDeleteRequest);

    const saveAuthorGroup = useCallback(async (title: string) => {
        await triggerGroupPost({ data: { title: title, authors: [] } });
    }, [triggerGroupPost]);

    const removeAuthorGroup = useCallback(async (groupId: string, authorId: string) => {
        await triggerGroupDelete([groupId, authorId]);
    }, [triggerGroupDelete]);

    return {
        authorGroups: data || [],
        saveAuthorGroup,
        removeAuthorGroup,
        error: fetchError | postGroupError | deleteGroupError,
        isLoading
    }
}