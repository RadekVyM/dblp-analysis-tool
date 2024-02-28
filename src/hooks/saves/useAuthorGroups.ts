'use client'

import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { useCallback } from 'react'
import { useIsClient, useLocalStorage } from 'usehooks-ts'
import { v4 as uuidv4 } from 'uuid'

const AUTHOR_GROUPS_STORAGE_KEY = 'AUTHOR_GROUPS_STORAGE_KEY';

/**
 * Hook that handles loading of author groups from the server and provides operations for managing the author groups -
 * adding and deleting an author group and adding and deleting an author from an author group.
 */
export default function useAuthorGroups() {
    const [authorGroups, setAuthorGroups] = useLocalStorage(AUTHOR_GROUPS_STORAGE_KEY, new Array<AuthorGroup>());
    const isClient = useIsClient();

    const importAuthorGroups = useCallback((importedAuthorGroups: Array<AuthorGroup>) => {
        setAuthorGroups((old) => {
            const newAuthorGroups: Array<AuthorGroup> = [];

            for (const importedAuthorGroup of importedAuthorGroups) {
                const group = old.find((g) => g.id === importedAuthorGroup.id);

                if (group) {
                    group.title = importedAuthorGroup.title;
                    group.authors = [...importedAuthorGroup.authors];
                    continue;
                }

                newAuthorGroups.push(importedAuthorGroup);
            }

            return [...newAuthorGroups, ...old];
        });
    }, [setAuthorGroups]);

    const saveAuthorGroup = useCallback((title: string) => {
        const id = uuidv4();
        setAuthorGroups((old) => {
            return [{ id: id, title: title, authors: [] }, ...old];
        });
        return id;
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
        canUseAuthorGroups: isClient,
        saveAuthorGroup,
        renameAuthorGroup,
        removeAuthorGroup,
        saveAuthorToGroup,
        removeAuthorFromGroup,
        importAuthorGroups
    };
}