/**
 * Returns whether an object contains any keys.
 * @param obj Object
 * @returns Boolean value indicating whether an object contains any keys
 */
export function anyKeys(obj: any): boolean {
    return Object.keys(obj).length !== 0
}