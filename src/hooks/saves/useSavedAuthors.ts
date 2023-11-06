'use client'

import { SavedAuthor } from '@/dtos/SavedAuthors'
import { fetchJson } from '@/services/fetching';
import { useCallback, useEffect } from 'react'
import useSWR, { Fetcher } from 'swr';
import useSWRMutation from 'swr/mutation'
import { useSessionStorage } from 'usehooks-ts'

const SESSION_SAVED_AUTHORS_KEY = 'session-saved-authors';

const savedAuthorsFetcher: Fetcher<Array<SavedAuthor> | null, string> = (key) =>
    fetchJson(key);

async function sendPostRequest<DataT, ResultT>(url: string, { arg }: { arg: DataT}) {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(arg)
    }).then(res => res.json() as ResultT)
}

async function sendDeleteRequest(url: string, { arg }: { arg: any }) {
    return fetch(`${url}/${arg}`, {
        method: 'DELETE'
    }).then(res => res.text())
}

export default function useSavedAuthors() {
    const { data, error: fetchError, isLoading } = useSWR('/api/save/author', savedAuthorsFetcher);
    const { trigger: triggerPost, error: postError } = useSWRMutation('/api/save/author', sendPostRequest<SavedAuthor, SavedAuthor>);
    const { trigger: triggerDelete, error: deleteError } = useSWRMutation('/api/save/author', sendDeleteRequest);

    const saveAuthor = useCallback(async (id: string, title: string) => {
        const author = await triggerPost({ title: title, id: id });
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