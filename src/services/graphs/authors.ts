import { DblpAuthor } from '@/dtos/DblpAuthor'
import { DblpPublication, DblpPublicationPerson } from '@/dtos/DblpPublication'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { prependDashedPrefix } from '@/utils/tailwindUtils'

const PRIMARY_FILL_CLASS = prependDashedPrefix('fill', 'primary');

export function getUniqueCoauthors(author: DblpAuthor, skip?: (author: DblpPublicationPerson) => boolean) {
    const map = new Map<string, DblpPublicationPerson>();

    author.publications.forEach((p) => p.authors.forEach((a) => {
        if (skip && skip(a)) {
            return
        }
        if (map.has(a.id)) {
            return
        }

        map.set(a.id, a);
    }));

    return [...map.values()]
}

export function convertToCoauthorsGraph(
    publications: Array<DblpPublication>,
    ignoredAuthorIds: Array<string> = [],
    primaryColoredAuthorIds: Array<string> = []) {
    const authorsMap = new Map<string, PublicationPersonNodeDatum>();
    const edgesMap = new Map<string, PublicationPersonLinkDatum>();

    publications.forEach(p => p.authors.forEach(a => {
        if (ignoredAuthorIds.includes(a.id)) {
            return;
        }

        const savedCoauthor = authorsMap.get(a.id);
        if (savedCoauthor) {
            savedCoauthor.count += 1;
        }
        else {
            authorsMap.set(a.id, {
                person: a,
                count: 1,
                colorCssProperty: primaryColoredAuthorIds.includes(a.id) ? '--primary' : undefined,
                coauthorIds: new Set()
            });
        }

        p.authors.forEach(co => {
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
                        publicationsCount: 1
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
    }
}

function setChildren(
    links: Array<PublicationPersonLinkDatum>,
    authorsMap: Map<string, PublicationPersonNodeDatum>) {
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
    }
}

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
    }
}