export function isNullOrWhiteSpace(text: string | undefined | null) {
    return !text || text.match(/^ *$/) !== null;
}

export function isNumber(str: string) {
    const num = parseFloat(str);
    return !isNaN(num) && isFinite(num);
}