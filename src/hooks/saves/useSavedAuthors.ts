'use client'

import { SavedAuthor } from '@/dtos/SavedAuthors'
import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from './shared'

const savedAuthorsFetcher: Fetcher<Array<SavedAuthor> | null, string> = (key) =>
    fetchJson(key);

export default function useSavedAuthors() {
    const { data, error: fetchError, isLoading } = useSWR('/api/save/author', savedAuthorsFetcher);
    const { trigger: triggerPost, error: postError } = useSWRMutation('/api/save/author', sendPostRequest<SavedAuthor, SavedAuthor>);
    const { trigger: triggerDelete, error: deleteError } = useSWRMutation('/api/save/author', sendDeleteRequest);

    const saveAuthor = useCallback(async (id: string, title: string) => {
        await triggerPost({ title: title, id: id });
    }, [triggerPost]);

    const removeSavedAuthor = useCallback(async (id: string) => {
        await triggerDelete(id);
    }, [triggerDelete]);

    return {
        savedAuthors: data || [],
        saveAuthor,
        removeSavedAuthor,
        error: fetchError | postError | deleteError,
        isLoading
    }
}