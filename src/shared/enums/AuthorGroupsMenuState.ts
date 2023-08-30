export const AuthorGroupsMenuState = {
    Collapsed: 'Collapsed',
    Floating: 'Floating',
    Docked: 'Docked',
} as const

export type AuthorGroupsMenuState = keyof typeof AuthorGroupsMenuState