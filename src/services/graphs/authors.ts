import { DblpAuthor } from '@/dtos/DblpAuthor'
import { DblpPublication, DblpPublicationPerson } from '@/dtos/DblpPublication'
import { PublicationPersonLinkDatum, PublicationPersonLinkDatumExtension } from '@/dtos/PublicationPersonLinkDatum'
import { PublicationPersonNodeDatum, PublicationPersonNodeDatumCanvasExtension, PublicationPersonNodeDatumExtension } from '@/dtos/PublicationPersonNodeDatum'
import { removeAccents } from '@/utils/strings';

const DEFAULT_LINK_VALUES: PublicationPersonLinkDatumExtension = {
    publicationsCount: 1,
    intensity: 1,
    isVisible: true,
    isHighlighted: false,
    isDim: false
} as const;

const DEFAULT_NODE_VALUES: PublicationPersonNodeDatumExtension & PublicationPersonNodeDatumCanvasExtension = {
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
    skip?: (author: DblpPublicationPerson) => boolean
): Array<DblpPublicationPerson> {
    const map = new Map<string, DblpPublicationPerson>();

    authors.forEach((author) => {
        author.publications.forEach((p) => [...p.authors, ...p.editors].forEach((a) => {
            if ((skip && skip(a)) || map.has(a.id)) {
                return;
            }

            map.set(a.id, a);
        }));
    });

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
    const edgesMap = new Map<string, PublicationPersonLinkDatum>();

    publications.forEach(p => [...p.authors, ...p.editors].forEach(a => {
        if (ignoredAuthorIds.includes(a.id)) {
            return;
        }

        const savedCoauthor = authorsMap.get(a.id);
        if (savedCoauthor) {
            savedCoauthor.count += 1;
        }
        else {
            authorsMap.set(a.id, {
                ...DEFAULT_NODE_VALUES,
                person: a,
                normalizedPersonName: removeAccents(a.name),
                count: 1,
                colorCssProperty: primaryColoredAuthorIds.includes(a.id) ? '--primary' : undefined,
                coauthorIds: new Set(),
            });
        }

        [...p.authors, ...p.editors].forEach(co => {
            if (co.id !== a.id) {
                const t = co.id < a.id;
                const sourceTarget = { source: t ? a.id : co.id, target: t ? co.id : a.id };
                const key = JSON.stringify(sourceTarget);
                const existingEdge = edgesMap.get(key);

                if (existingEdge) {
                    existingEdge.publicationsCount += 1;
                }
                else {
                    edgesMap.set(key, {
                        ...sourceTarget,
                        ...DEFAULT_LINK_VALUES
                    });
                }
            }
        });
    }));
    const nodes = [...authorsMap.values()];
    const links = [...edgesMap.values()];
    nodes.sort((a, b) => b.count - a.count);

    const childrenStats = setChildren(links, authorsMap);

    return {
        nodes,
        links,
        authorsMap,
        ...childrenStats,
        ...getLinksLimits(links)
    };
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