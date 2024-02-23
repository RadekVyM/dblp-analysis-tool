export type DblpVenueTopAuthor = {
    nameId: string,
    name: string,
    publicationsCount: number
}

export function createDblpVenueTopAuthor(
    nameId: string,
    publicationsCount: number
): DblpVenueTopAuthor {
    const name = convertNameIdToName(nameId);

    return {
        nameId,
        publicationsCount,
        name: name
    };
}

function convertNameIdToName(nameId: string) {
    const match = nameId.match(/(.*)\d\d\d\d.*/);
    let name = nameId;

    if (match && match[0]) {
        name = match[1];
    }

    return name.replaceAll('_', ' ').trim();
}