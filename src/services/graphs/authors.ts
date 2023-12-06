import { DblpPublication } from '@/dtos/DblpPublication'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { prependDashedPrefix } from '@/utils/tailwindUtils'

const PRIMARY_FILL_CLASS = prependDashedPrefix('fill', 'primary');

export function convertToCoauthorsGraph(
    publications: Array<DblpPublication>,
    ignoredAuthorIds: Array<string> = [],
    primaryColoredAuthorIds: Array<string> = []) {
    const authorsMap = new Map<string, PublicationPersonNodeDatum>();

    const edgesSet = new Set<string>();
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
                colorClass: primaryColoredAuthorIds.includes(a.id) ? PRIMARY_FILL_CLASS : undefined,
                coauthorIds: new Set()
            });
        }

        p.authors.forEach(co => {
            if (co.id !== a.id) {
                const t = co.id < a.id;
                edgesSet.add(JSON.stringify({ source: t ? a.id : co.id, target: t ? co.id : a.id } as PublicationPersonLinkDatum));
            }
        });
    }));
    const coauthors = [...authorsMap.values()];
    const edges = [...edgesSet.values()].map(e => JSON.parse(e) as PublicationPersonLinkDatum);
    coauthors.sort((a, b) => b.count - a.count);

    return {
        nodes: coauthors,
        links: edges,
        authorsMap,
        ...getCoauthorCountsLimits(edges, authorsMap)
    }
}

function getCoauthorCountsLimits(
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