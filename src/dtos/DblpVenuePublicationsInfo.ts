export type DblpVenuePublicationsInfo = {
    yearlyPublications: Array<DblpVenueYearlyPublicationsCount>,
    totalPublicationsCount: number
}

export type DblpVenueYearlyPublicationsCount = {
    year: number,
    count: number
}

export function craeteDblpVenueYearlyPublicationsCount(
    year: number,
    count: number
) {
    return {
        year,
        count
    };
}

export function createDblpVenuePublicationsInfo(
    yearlyPublications: Array<DblpVenueYearlyPublicationsCount>
): DblpVenuePublicationsInfo {
    return {
        yearlyPublications,
        totalPublicationsCount: yearlyPublications.reduce((acc, item) => acc + item.count, 0)
    };
}