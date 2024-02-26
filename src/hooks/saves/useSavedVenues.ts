'use client'

import { SavedVenue } from '@/dtos/saves/SavedVenue'
import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from '../shared'

const savedVenuesFetcher: Fetcher<Array<SavedVenue> | null, string> = (key) =>
    fetchJson(key);

/** Hook that handles loading of saved venues from the server and provides operations for posting and deleting a saved venue. */
export default function useSavedVenues() {
    const { data, error: fetchError, isLoading } = useSWR('/api/save/venue', savedVenuesFetcher);
    const { trigger: triggerPost, error: postError, isMutating: isMutatingPost } = useSWRMutation('/api/save/venue', sendPostRequest<SavedVenue, SavedVenue>);
    const { trigger: triggerDelete, error: deleteError, isMutating: isMutatingDelete } = useSWRMutation('/api/save/venue', sendDeleteRequest);

    const saveVenue = useCallback(async (id: string, title: string) => {
        await triggerPost({ data: { title: title, id: id } });
    }, [triggerPost]);

    const removeSavedVenue = useCallback(async (id: string) => {
        await triggerDelete([id]);
    }, [triggerDelete]);

    return {
        savedVenues: data || [],
        saveVenue,
        removeSavedVenue,
        fetchError,
        mutationError: postError || deleteError,
        isMutating: isMutatingPost || isMutatingDelete,
        isLoading
    };
}