import { DblpAuthor } from '@/dtos/DblpAuthor'
import { DblpPublication, DblpPublicationPerson } from '@/dtos/DblpPublication'
import { NodeDatumCanvasExtension } from '@/dtos/data-visualisation/graphs/NodeDatum'
import { PublicationPersonLinkDatum, PublicationPersonLinkDatumExtension } from '@/dtos/data-visualisation/graphs/PublicationPersonLinkDatum'
import { PublicationPersonNodeDatum, PublicationPersonNodeDatumExtension } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { removeAccents } from '@/utils/strings'

const DEFAULT_LINK_VALUES: PublicationPersonLinkDatumExtension = {
    publicationsCount: 1,
    intensity: 1,
    isIgnored: false,
    isVisible: true,
    isHighlighted: false,
    isDim: false
} as const;

const DEFAULT_NODE_VALUES: PublicationPersonNodeDatumExtension & NodeDatumCanvasExtension = {
    isVisible: true,
    isHighlighted: false,
    isDim: false,
    isLabelVisible: false,
    isOriginalAuthorNode: false,
    canvasRadius: 0,
    canvasX: 0,
    canvasY: 0
} as const;

/**
 * Returns all the unique coauthors of authors in a list.
 * @param authors List of coauthors
 * @param skip Whether an author should be skipped
 * @returns List of authors
 */
export function getUniqueCoauthors(
    authors: Array<DblpAuthor>,
    publications?: Array<DblpPublication>,
    skip?: (author: DblpPublicationPerson) => boolean
): Array<DblpPublicationPerson> {
    const map = new Map<string, DblpPublicationPerson>();

    authors.forEach((author) => {
        author.publications.forEach((p) => extractCoauthorsOfPublicationToMap(p, map, skip));
    });

    publications?.forEach((p) => extractCoauthorsOfPublicationToMap(p, map, skip));

    return [...map.values()];
}

/**
 * Creates a graph from a list of publications.
 * @param publications Publications
 * @param ignoredAuthorIds IDs of authors that are not included in the graph
 * @param primaryColoredAuthorIds IDs of authors that are colored using the primary color
 * @returns Nodes, links and other statistics or parts of the graph
 */
export function convertToCoauthorsGraph(
    publications: Array<DblpPublication>,
    ignoredAuthorIds: Array<string> = [],
    primaryColoredAuthorIds: Array<string> = []
) {
    const authorsMap = new Map<string, PublicationPersonNodeDatum>();
    const linksMap = new Map<string, PublicationPersonLinkDatum>();

    publications.forEach(p => [...p.authors, ...p.editors].forEach(a => {
        if (ignoredAuthorIds.includes(a.id)) {
            return;
        }

        saveNode(a, primaryColoredAuthorIds, authorsMap);
        extractLinksToAuthor(p, a, linksMap);
    }));
    const nodes = [...authorsMap.values()];
    const links = [...linksMap.values()];
    nodes.sort((a, b) => b.personOccurrenceCount - a.personOccurrenceCount);

    const childrenStats = setChildren(links, authorsMap);

    return {
        nodes,
        links,
        authorsMap,
        ...childrenStats,
        ...getLinksLimits(links)
    };
}

/** Saves a specified author to the nodes map. */
function saveNode(a: DblpPublicationPerson, primaryColoredAuthorIds: string[], authorsMap: Map<string, PublicationPersonNodeDatum>) {
    const savedCoauthor = authorsMap.get(a.id);

    if (savedCoauthor) {
        savedCoauthor.personOccurrenceCount += 1;
    }
    else {
        authorsMap.set(a.id, {
            ...DEFAULT_NODE_VALUES,
            person: a,
            id: a.id,
            label: a.name,
            normalizedPersonName: removeAccents(a.name).toLowerCase(),
            personOccurrenceCount: 1,
            colorCssProperty: primaryColoredAuthorIds.includes(a.id) ? '--primary' : undefined,
            coauthorIds: new Set(),
        });
    }
}

/** Finds all links to a specified author and saves them to the links map. */
function extractLinksToAuthor(publication: DblpPublication, author: DblpPublicationPerson, linksMap: Map<string, PublicationPersonLinkDatum>) {
    [...publication.authors, ...publication.editors].forEach(co => {
        if (co.id !== author.id) {
            const t = co.id < author.id;
            const sourceTarget = { source: t ? author.id : co.id, target: t ? co.id : author.id };
            const key = JSON.stringify(sourceTarget);
            const existingLink = linksMap.get(key);

            if (existingLink) {
                existingLink.publicationsCount += 1;
            }
            else {
                linksMap.set(key, {
                    ...sourceTarget,
                    ...DEFAULT_LINK_VALUES
                });
            }
        }
    });
}

/** Sets up children collections of all graph nodes. */
function setChildren(
    links: Array<PublicationPersonLinkDatum>,
    authorsMap: Map<string, PublicationPersonNodeDatum>
) {
    let minCoauthorsCount = 0;
    let maxCoauthorsCount = 0;

    links.forEach((e) => {
        const source = authorsMap.get(e.source as string);
        const target = authorsMap.get(e.target as string);
        source?.coauthorIds.add(e.target as string);
        target?.coauthorIds.add(e.source as string);

        const min = Math.min(source?.coauthorIds?.size || 0, target?.coauthorIds?.size || 0);
        const max = Math.max(source?.coauthorIds?.size || 0, target?.coauthorIds?.size || 0);

        if (minCoauthorsCount > min) {
            minCoauthorsCount = min;
        }

        if (maxCoauthorsCount < max) {
            maxCoauthorsCount = max;
        }
    });

    return {
        minCoauthorsCount,
        maxCoauthorsCount
    };
}

/** Returns min and max publications count of a link. */
function getLinksLimits(links: Array<PublicationPersonLinkDatum>) {
    let minCoauthoredPublicationsCount = 0;
    let maxCoauthoredPublicationsCount = 0;

    links.forEach((e) => {
        if (minCoauthoredPublicationsCount > e.publicationsCount) {
            minCoauthoredPublicationsCount = e.publicationsCount;
        }

        if (maxCoauthoredPublicationsCount < e.publicationsCount) {
            maxCoauthoredPublicationsCount = e.publicationsCount;
        }
    });

    return {
        minCoauthoredPublicationsCount,
        maxCoauthoredPublicationsCount
    };
}

/** Puts all authors of a publication to a map. */
function extractCoauthorsOfPublicationToMap(
    p: DblpPublication,
    map: Map<string, DblpPublicationPerson>,
    skip?: ((author: DblpPublicationPerson) => boolean)
): void {
    [...p.authors, ...p.editors].forEach((a) => {
        if ((skip && skip(a)) || map.has(a.id)) {
            return;
        }

        map.set(a.id, a);
    });
}