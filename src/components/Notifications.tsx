'use client'

import useNotifications, { Notification } from '@/hooks/useNotifications'
import { useIsClient } from 'usehooks-ts'
import Button from './Button'
import { useEffect, useState } from 'react'
import { MdCheckCircle, MdClose, MdReportProblem } from 'react-icons/md'
import { cn } from '@/utils/tailwindUtils'
import { NotificationType } from '@/enums/NotificationType'

type NotificationItemParams = {
    notification: Notification,
    removeNotification: (notification: Notification) => void
}

export default function Notifications() {
    const { notifications, removeNotification } = useNotifications();
    const isClient = useIsClient();

    return (
        <div
            className='fixed inset-0 z-[1000] grid justify-start items-end pointer-events-none'>
            {
                isClient &&
                <ul
                    className='flex flex-col gap-2 p-4'>
                    {notifications.map((notification) =>
                        <NotificationItem
                            key={notification.key}
                            notification={notification}
                            removeNotification={removeNotification} />)}
                </ul>
            }
        </div>
    )
}

function NotificationItem({ notification, removeNotification }: NotificationItemParams) {
    const [progressClass, setProgressClass] = useState('');

    useEffect(() => {
        if (!notification.autoclose) {
            return
        }

        setProgressClass('animate-widthShrink');

        const timeout = setTimeout(() => {
            removeNotification(notification);
            setProgressClass('');
        }, 4500);

        return () => clearTimeout(timeout)
    }, []);

    return (
        <li
            className='pointer-events-auto bg-surface-container border border-outline rounded-lg shadow-2xl max-w-md w-full overflow-hidden'>
            <div
                className='flex gap-4 items-center pl-3 pr-2 py-2'>
                {notificationIcon(notification.type)}

                <div
                    className='flex-1 text-sm'>
                    <span
                        className='align-middle'>
                        {notification.message}
                    </span>
                </div>

                <Button
                    title='Close'
                    variant='icon-outline'
                    size='xs'
                    className='self-start'
                    onClick={() => removeNotification(notification)}>
                    <MdClose
                        className='w-4 h-4' />
                </Button>
            </div>
            {
                notification.autoclose &&
                <div
                    className={cn('h-1 w-full', notificationBgColor(notification.type), progressClass)}>
                </div>
            }
        </li>
    )
}

function notificationIcon(type: NotificationType) {
    switch (type) {
        case NotificationType.Success:
            return (
                <MdCheckCircle
                    className='text-primary' />
            )
        case NotificationType.Error:
            return (
                <MdReportProblem
                    className='text-danger' />
            )
    }
}

function notificationBgColor(type: NotificationType) {
    switch (type) {
        case NotificationType.Success:
            return 'bg-primary'
        case NotificationType.Error:
            return 'bg-danger'
    }
}