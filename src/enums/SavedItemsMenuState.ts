/** State of a saved items menu that is displayed on the side. */
export const SavedItemsMenuState = {
    Collapsed: 'Collapsed',
    Floating: 'Floating',
    Docked: 'Docked',
} as const;

/** State of a saved items menu that is displayed on the side. */
export type SavedItemsMenuState = keyof typeof SavedItemsMenuState;