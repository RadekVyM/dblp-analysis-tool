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
        setNotifications((old) => [...(old.filter((n) => n.key !== notification.key)), notification]);
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