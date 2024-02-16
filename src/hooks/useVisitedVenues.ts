'use client'

import { SavedVenue, } from '@/dtos/saves/SavedVenue'
import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from './saves/shared'
import { VisitedVenue } from '@/dtos/saves/VisitedVenue'

const visitedAuthorsFetcher: Fetcher<Array<VisitedVenue> | null, string> = (key) =>
    fetchJson(key);

export default function useVisitedAuthors() {
    const { data, error: fetchError, isLoading } =
        useSWR('/api/visit/venue', visitedAuthorsFetcher);
    const { trigger: triggerPost, error: postError, isMutating: isMutatingPost } =
        useSWRMutation('/api/visit/venue', sendPostRequest<SavedVenue, VisitedVenue>);
    const { trigger: triggerDelete, error: deleteError, isMutating: isMutatingDelete } =
        useSWRMutation('/api/visit/venue', sendDeleteRequest);

    const visitedVenue = useCallback(async (id: string, title: string) => {
        await triggerPost({ data: { title: title, id: id } });
    }, [triggerPost]);

    const removeVisitedVenue = useCallback(async (id: string) => {
        await triggerDelete([id]);
    }, [triggerDelete]);

    return {
        visitedVenues: data || [],
        visitedVenue,
        removeVisitedVenue,
        error: fetchError || postError || deleteError,
        isMutating: isMutatingPost || isMutatingDelete,
        isLoading
    }
}