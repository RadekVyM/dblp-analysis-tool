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