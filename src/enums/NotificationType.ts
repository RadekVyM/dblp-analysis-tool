/** Type of a notification that can be displayed. */
export const NotificationType = {
    Success: 'Success',
    Error: 'Error'
} as const;

/** Type of a notification that can be displayed. */
export type NotificationType = keyof typeof NotificationType