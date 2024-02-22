export function convertToExternalLinks(links: Array<string>) {
    return links.map((link) => {
        const url = new URL(link);

        return {
            url: link,
            title: url.hostname,
            icon: getIconUrl(url)
        }
    });
}

/** Creates an icon URL from a specified URL. */
function getIconUrl(url: URL): string {
    return `https://www.google.com/s2/favicons?domain=${url.hostname.split('.').slice(-2).join('.')}&sz=16`;
}