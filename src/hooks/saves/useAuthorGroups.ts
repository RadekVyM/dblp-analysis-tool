'use client'

import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { fetchJson } from '@/services/fetch'
import { useCallback } from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import { sendDeleteRequest, sendPostRequest } from '../shared'
import { SavedAuthor } from '@/dtos/saves/SavedAuthor'

const authorGroupsFetcher: Fetcher<Array<AuthorGroup> | null, string> = (key) =>
    fetchJson(key);

/**
 * Hook that handles loading of author groups from the server and provides operations for managing the author groups -
 * adding and deleting an author group and adding and deleting an author from an author group.
 */
export default function useAuthorGroups() {
    const { data, error: fetchError, isLoading } =
        useSWR('/api/save/authorgroup', authorGroupsFetcher);
    const { trigger: triggerGroupPost, error: postGroupError, isMutating: isMutatingGroupPost } =
        useSWRMutation('/api/save/authorgroup', sendPostRequest<Omit<AuthorGroup, 'id' | 'authors'> & { id?: string }, AuthorGroup>);
    const { trigger: triggerGroupDelete, error: deleteGroupError, isMutating: isMutatingGroupDelete } =
        useSWRMutation('/api/save/authorgroup', sendDeleteRequest);
    const { trigger: triggerGroupAuthorPost, error: postGroupAuthorError, isMutating: isMutatingGroupAuthorPost } =
        useSWRMutation('/api/save/authorgroup', sendPostRequest<SavedAuthor, AuthorGroup>);
    const { trigger: triggerGroupAuthorDelete, error: deleteGroupAuthorError, isMutating: isMutatingGroupAuthorDelete } =
        useSWRMutation('/api/save/authorgroup', sendDeleteRequest);

    const saveAuthorGroup = useCallback(async (title: string) => {
        await triggerGroupPost({ data: { title: title } });
    }, [triggerGroupPost]);

    const renameAuthorGroup = useCallback(async (id: string, title: string) => {
        await triggerGroupPost({ data: { id: id, title: title } });
    }, [triggerGroupPost]);

    const removeAuthorGroup = useCallback(async (groupId: string) => {
        await triggerGroupDelete([groupId]);
    }, [triggerGroupDelete]);

    const saveAuthorToGroup = useCallback(async (groupId: string, authorId: string, authorName: string) => {
        await triggerGroupAuthorPost({ data: { id: authorId, title: authorName }, urlParams: [groupId] });
    }, [triggerGroupPost]);

    const removeAuthorFromGroup = useCallback(async (groupId: string, authorId: string) => {
        await triggerGroupAuthorDelete([groupId, authorId]);
    }, [triggerGroupPost]);

    return {
        authorGroups: data || [],
        saveAuthorGroup,
        renameAuthorGroup,
        removeAuthorGroup,
        saveAuthorToGroup,
        removeAuthorFromGroup,
        fetchError,
        mutationError: postGroupError || deleteGroupError,
        authorMutationError: postGroupAuthorError || deleteGroupAuthorError,
        isLoading,
        isMutating: isMutatingGroupPost || isMutatingGroupDelete || isMutatingGroupAuthorPost || isMutatingGroupAuthorDelete
    };
}