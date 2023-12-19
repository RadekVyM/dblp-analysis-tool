/**
 * Returns whether a string is null, undefined, contains no characters or only white characters.
 * @param str Input string
 * @returns Boolean value
 */
export function isNullOrWhiteSpace(str: string | undefined | null) {
    return !str || str.match(/^ *$/) !== null;
}

/**
 * Returns whether a string is a number.
 * @param str Input string
 * @returns Boolean value
 */
export function isNumber(str: string) {
    return !isNullOrWhiteSpace(str) && !Number.isNaN(+str);
}