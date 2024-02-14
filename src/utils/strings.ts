/**
 * Returns whether a string is null, undefined, contains no characters or only white characters.
 * @param str Input string
 * @returns Boolean value
 */
export function isNullOrWhiteSpace(str: string | undefined | null): boolean {
    return !str || str.match(/^ *$/) !== null;
}

/**
 * Returns whether a string is a number.
 * @param str Input string
 * @returns Boolean value
 */
export function isNumber(str: string): boolean {
    return !isNullOrWhiteSpace(str) && !Number.isNaN(+str);
}

/**
 * Removes accents from a string.
 * @param str Input string
 * @returns Input string without accents
 */
export function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}