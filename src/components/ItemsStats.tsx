import { getCurrentLocale } from '@/utils/locales';
import DividedDefinitionList from './DividedDefinitionList'

type ItemsStatsParams = {
    totalCount: number,
    displayedCount?: number,
    className?: string,
    additionalItems?: Array<{ term: string, definition: string }>
}

/** Component that displays information about total and currently displayed items counts. */
export default function ItemsStats({ totalCount, displayedCount, additionalItems, className }: ItemsStatsParams) {
    const items = [
        { term: 'Total count:', definition: totalCount.toLocaleString(getCurrentLocale(), { useGrouping: true }) }
    ];

    if (displayedCount === 0 || displayedCount) {
        items.push({ term: 'Displayed count:', definition: displayedCount.toLocaleString(getCurrentLocale(), { useGrouping: true }) });
    }

    if (additionalItems && additionalItems.length > 0) {
        additionalItems.forEach((item) => items.push(item));
    }

    return (
        <DividedDefinitionList
            className={className}
            items={items} />
    )
}