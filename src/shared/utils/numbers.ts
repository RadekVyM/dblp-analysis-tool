export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(value, min));
}

export function repeat<T>(count: number, action: (index: number) => T) {
    const values: Array<T> = [];

    for (let i = 0; i < count; i++) {
        values.push(action(i));
    }

    return values;
}