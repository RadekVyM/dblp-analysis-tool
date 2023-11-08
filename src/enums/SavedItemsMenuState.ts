export const SavedItemsMenuState = {
    Collapsed: 'Collapsed',
    Floating: 'Floating',
    Docked: 'Docked',
} as const

export type SavedItemsMenuState = keyof typeof SavedItemsMenuState