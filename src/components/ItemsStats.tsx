import DividedDefinitionList from './DividedDefinitionList'

type ItemsStatsParams = {
    totalCount: number,
    displayedCount?: number,
    className?: string
}

export default function ItemsStats({ totalCount, displayedCount, className }: ItemsStatsParams) {
    const items = [
        { term: 'Total count:', definition: totalCount.toLocaleString(undefined, { useGrouping: true }) }
    ];

    if (displayedCount === 0 || displayedCount) {
        items.push({ term: 'Displayed count:', definition: displayedCount.toLocaleString(undefined, { useGrouping: true }) });
    }

    return (
        <DividedDefinitionList
            className={className}
            items={items} />
    )
}