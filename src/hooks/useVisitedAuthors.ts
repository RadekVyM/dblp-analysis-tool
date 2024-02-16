'use client'

import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from './saves/shared'
import { VisitedAuthor } from '@/dtos/saves/VisitedAuthor'
import { SavedAuthor } from '@/dtos/saves/SavedAuthor'

const visitedAuthorsFetcher: Fetcher<Array<VisitedAuthor> | null, string> = (key) =>
    fetchJson(key);

export default function useVisitedAuthors() {
    const { data, error: fetchError, isLoading } =
        useSWR('/api/visit/author', visitedAuthorsFetcher);
    const { trigger: triggerPost, error: postError, isMutating: isMutatingPost } =
        useSWRMutation('/api/visit/author', sendPostRequest<SavedAuthor, VisitedAuthor>);
    const { trigger: triggerDelete, error: deleteError, isMutating: isMutatingDelete } =
        useSWRMutation('/api/visit/author', sendDeleteRequest);

    const visitedAuthor = useCallback(async (id: string, title: string) => {
        await triggerPost({ data: { title: title, id: id } });
    }, [triggerPost]);

    const removeVisitedAuthor = useCallback(async (id: string) => {
        await triggerDelete([id]);
    }, [triggerDelete]);

    return {
        visitedAuthors: data || [],
        visitedAuthor,
        removeVisitedAuthor,
        error: fetchError || postError || deleteError,
        isMutating: isMutatingPost || isMutatingDelete,
        isLoading
    }
}