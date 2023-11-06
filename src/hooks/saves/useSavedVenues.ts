'use client'

import { SavedVenue } from '@/dtos/SavedVenues'
import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from './shared'

const savedVenuesFetcher: Fetcher<Array<SavedVenue> | null, string> = (key) =>
    fetchJson(key);

export default function useSavedVenues() {
    const { data, error: fetchError, isLoading } = useSWR('/api/save/venue', savedVenuesFetcher);
    const { trigger: triggerPost, error: postError } = useSWRMutation('/api/save/venue', sendPostRequest<SavedVenue, SavedVenue>);
    const { trigger: triggerDelete, error: deleteError } = useSWRMutation('/api/save/venue', sendDeleteRequest);

    const saveVenue = useCallback(async (id: string, title: string) => {
        await triggerPost({ title: title, id: id });
    }, [triggerPost]);

    const removeSavedVenue = useCallback(async (id: string) => {
        await triggerDelete(id);
    }, [triggerDelete]);

    return {
        savedVenues: data || [],
        saveVenue,
        removeSavedVenue,
        error: fetchError | postError | deleteError,
        isLoading
    }
}