export function isNumber(str: string) {
    const num = parseFloat(str);
    return !isNaN(num) && isFinite(num);
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(value, min));
}