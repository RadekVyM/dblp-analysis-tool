export const BookmarksSideMenuState = {
    Collapsed: 'Collapsed',
    Floating: 'Floating',
    Docked: 'Docked',
} as const

export type BookmarksSideMenuState = keyof typeof BookmarksSideMenuState