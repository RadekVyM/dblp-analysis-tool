export const NotificationType = {
    Success: 'Success',
    Error: 'Error'
} as const

export type NotificationType = keyof typeof NotificationType
