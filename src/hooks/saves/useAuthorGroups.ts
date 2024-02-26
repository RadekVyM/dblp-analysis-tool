'use client'

import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { v4 as uuidv4 } from 'uuid'

const AUTHOR_GROUPS_STORAGE_KEY = 'AUTHOR_GROUPS_STORAGE_KEY';

/**
 * Hook that handles loading of author groups from the server and provides operations for managing the author groups -
 * adding and deleting an author group and adding and deleting an author from an author group.
 */
export default function useAuthorGroups() {
    const [authorGroups, setAuthorGroups] = useLocalStorage(AUTHOR_GROUPS_STORAGE_KEY, new Array<AuthorGroup>());

    const saveAuthorGroup = useCallback((title: string) => {
        setAuthorGroups((old) => {
            return [{ id: uuidv4(), title: title, authors: [] }, ...old];
        });
    }, [setAuthorGroups]);

    const renameAuthorGroup = useCallback((id: string, title: string) => {
        setAuthorGroups((old) => {
            const group = old.find((g) => g.id === id);

            if (group) {
                group.title = title;
            }

            return [...old];
        });
    }, [setAuthorGroups]);

    const removeAuthorGroup = useCallback((groupId: string) => {
        setAuthorGroups((old) => {
            return [...(old.filter((g) => g.id !== groupId))];
        });
    }, [setAuthorGroups]);

    const saveAuthorToGroup = useCallback((groupId: string, authorId: string, authorName: string) => {
        setAuthorGroups((old) => {
            const group = old.find((g) => g.id === groupId);

            if (group && !group.authors.some(((a) => a.id === authorId))) {
                group.authors = [{ id: authorId, title: authorName }, ...group.authors];
            }

            return [...old];
        });
    }, [setAuthorGroups]);

    const removeAuthorFromGroup = useCallback((groupId: string, authorId: string) => {
        setAuthorGroups((old) => {
            const group = old.find((g) => g.id === groupId);

            if (group) {
                group.authors = [...group.authors.filter((a) => a.id !== authorId)];
            }

            return [...old];
        });
    }, [setAuthorGroups]);

    return {
        authorGroups,
        saveAuthorGroup,
        renameAuthorGroup,
        removeAuthorGroup,
        saveAuthorToGroup,
        removeAuthorFromGroup,
        fetchError: undefined,
        mutationError: undefined,
        authorMutationError: undefined,
        isLoading: false,
        isMutating: false
    };
}