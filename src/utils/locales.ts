let headers: any = undefined;

/**
 * Returns current locale as a string or undefined. This can be used for number formatting.
 */
export function getCurrentLocale() {
    if (typeof (window) !== 'undefined') {
        return undefined;
    }

    // Get locale from the request on the server 
    headers = require('next/headers').headers;

    if (!headers) {
        return undefined;
    }

    const headersList = headers();
    const language = headersList.get('accept-language');
    const locale = language?.split(';')[0]?.split(',')[0] || undefined;
    return locale;
}