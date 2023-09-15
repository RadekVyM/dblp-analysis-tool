
export function group<KeyT, ItemT>(items: Array<ItemT>, by: (item: ItemT) => any) {
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
