'use client'

import useNotifications, { Notification } from '@/hooks/useNotifications'
import { useHover, useIsClient, useTimeout } from 'usehooks-ts'
import Button from '../Button'
import { useEffect, useRef, useState } from 'react'
import { MdCheckCircle, MdClose, MdReportProblem } from 'react-icons/md'
import { cn } from '@/utils/tailwindUtils'
import { NotificationType } from '@/enums/NotificationType'
import useTimer from '@/hooks/useTimer'

type NotificationItemParams = {
    notification: Notification,
    removeNotification: (notification: Notification) => void
}

export default function Notifications() {
    const { notifications, removeNotification } = useNotifications();
    const isClient = useIsClient();

    return (
        <>
            {
                isClient &&
                <ul
                    aria-live='polite'
                    className='flex flex-col gap-2 p-4 max-w-md w-full fixed right-0 bottom-0 z-[1000] pointer-events-none'>
                    {notifications.map((notification) =>
                        <NotificationItem
                            key={notification.key}
                            notification={notification}
                            removeNotification={removeNotification} />)}
                </ul>
            }
        </>
    )
}

function NotificationItem({ notification, removeNotification }: NotificationItemParams) {
    const { progress, paused, start, pause, resume, stop } = useTimer(4500, () => {
        removeNotification(notification);
    });
    const itemRef = useRef(null);
    const isHovered = useHover(itemRef);

    if (notification.autoclose) {
        start();
    }

    useEffect(() => {
        if (!notification.autoclose) {
            return
        }

        if (isHovered) {
            pause();
        }
        else {
            resume();
        }
    }, [isHovered]);

    return (
        <li
            ref={itemRef}
            aria-atomic='true' role={notificationRole(notification.type)}
            className='pointer-events-auto bg-surface-container border border-outline rounded-lg shadow-2xl w-full overflow-hidden animate-slideUpIn'>
            <div
                className='flex gap-4 items-center pl-3 pr-2 py-2'>
                {notificationIcon(notification.type)}

                <div
                    className='flex-1 text-sm leading-4'>
                    <span
                        className='align-middle'>
                        {notification.message}
                    </span>
                </div>

                <Button
                    aria-label='Close notification'
                    title='Close'
                    variant='icon-outline'
                    size='xs'
                    className='self-start'
                    onClick={() => {
                        stop();
                        removeNotification(notification);
                    }}>
                    <MdClose
                        className='w-4 h-4' />
                </Button>
            </div>
            {
                notification.autoclose &&
                <div
                    style={{ width: `${(1 - progress) * 100}%` }}
                    className={cn('h-1 w-full', notificationBgColor(notification.type))}>
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

function notificationRole(type: NotificationType) {
    switch (type) {
        case NotificationType.Success:
            return 'status'
        case NotificationType.Error:
            return 'alert'
    }
}