import { repeat } from './array'

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
 * Returns a string of numbers that occur in a string.
 * @param str Input string
 * @returns String of numbers
 */
export function extractOnlyNumbers(str: string): string {
    return str.replace(/[^0-9]/g, '');
}

/**
 * Removes accents from a string.
 * @param str Input string
 * @returns Input string without accents
 */
export function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Returns whether a string includes at least one of the specified phrases. Accents and character case are ignored.
 * @param str Input string
 * @param phrases Specified phrases
 * @returns Whether a string includes specified phrases
 */
export function searchIncludes(str: string, ...phrases: Array<string>) {
    const searchedString = removeAccents(str).toLowerCase();
    return phrases.length === 0 || phrases.some((s) => searchedString.includes(s));
}

/**
 * Parses all passed strings if they are integers.
 * @param numberStrings String or array of strings
 * @returns Array of numbers
 */
export function parseIntStrings(numberStrings: Array<string> | string) {
    if (typeof numberStrings === 'string') {
        return isNumber(numberStrings) ? [parseInt(numberStrings)] : [];
    }
    else {
        return numberStrings.map((s) => isNumber(s) && parseInt(s)).filter((n) => n !== false) as Array<number>;
    }
}

/**
 * Properly indents all nodes of a XML string.
 * 
 * This is not super robust implementation, but it works for XML strings returned from XMLSerializer.
 * @param xml XML string (ideally returned from XMLSerializer)
 * @returns Prettified XML string
 */
export function prettifyXml(xml: string) {
    const newLineXml = xml.replaceAll(/\>\s*\</g, '>\n<');
    const lines = newLineXml.split('\n').filter((l) => l.length > 0);
    let rootFound = false;
    let closedPrevious = false;
    let tabsCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('<?')) {
            tabsCount = 0;
        }
        else if (line.startsWith('</')) {
            tabsCount -= 1;
            closedPrevious = true;
        }
        else if (line.startsWith('<') && !(line.endsWith('/>') || line.includes('</'))) {
            if (rootFound && !closedPrevious) {
                tabsCount += 1;
            }
            closedPrevious = false;
            rootFound = true;
        }
        else if (line.startsWith('<') && (line.endsWith('/>') || line.includes('</')) && rootFound) {
            if (!closedPrevious) {
                tabsCount += 1;
            }
            closedPrevious = true;
        }

        lines[i] = `${repeat(tabsCount, () => '\t').join('')}${line}`;
    }

    return lines.join('\n');
}