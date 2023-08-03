export function normalizeQuery(query: string) {
    const words = query.split(' ').filter(s => s.length > 0);

    return words.join('+');
}