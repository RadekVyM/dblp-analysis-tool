'use client'

import { NotificationType } from '@/enums/NotificationType'
import { useCallback } from 'react'
import { useSessionStorage } from 'usehooks-ts'

const NOTIFICATIONS_STORAGE_KEY = 'NOTIFICATIONS_STORAGE'

export type Notification = {
    message: string,
    key: string,
    type: NotificationType,
    autoclose?: boolean
}

export default function useNotifications() {
    const [notifications, setNotifications] = useSessionStorage<Array<Notification>>(NOTIFICATIONS_STORAGE_KEY, []);

    const pushNotification = useCallback((notification: Notification) => {
        // I need to ensure that each notification has a unique key
        // to perform a re-render of the notification component
        const joinSymbol = '___';
        const key = notification.key;
        notification.key = `${key}${joinSymbol}${Math.round(Math.random() * 1000000000)}`;

        setNotifications((old) => [...(old.filter((n) => n.key.split(joinSymbol).at(0) !== key)), notification]);
    }, [setNotifications]);

    const removeNotification = useCallback((notification: Notification) => {
        setNotifications((old) => old.filter((n) => n !== notification));
    }, [setNotifications]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, [setNotifications]);

    return {
        notifications,
        pushNotification,
        removeNotification,
        clearNotifications
    }
}