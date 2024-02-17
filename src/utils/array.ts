/**
 * Groups items by a property value.
 * @param items An array of groupable items.
 * @param by Function returning an item's property value by which the item is placed in a specific group.
 * @returns Map of grouped items.
 */
export function group<KeyT, ItemT>(items: Array<ItemT>, by: (item: ItemT) => any): Map<KeyT, Array<ItemT>> {
    const map = new Map<KeyT, Array<ItemT>>();

    items.forEach((item) => {
        const key = by(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });

    return map;
}

/**
 * Returns an array of a certain length that contains elements returned from a specified function.
 * @param count Length of the array
 * @param action Function that returns an element based on its index in the array.
 * @returns Array of elements
 */
export function repeat<T>(count: number, action: (index: number) => T): Array<T> {
    const values: Array<T> = [];

    for (let i = 0; i < count; i++) {
        values.push(action(i));
    }

    return values;
}

/**
 * Returns whether there are any items passed to the function.
 * @param items 
 * @returns True if there are some items passed to the function
 */
export function anyItems(...items: Array<any>): boolean {
    return items.length > 0;
}