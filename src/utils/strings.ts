export function isNullOrWhiteSpace(text: string | undefined | null) {
    return !text || text.match(/^ *$/) !== null;
}

export function isNumber(str: string) {
    return !Number.isNaN(+str);
}