import { FilterStatesMap, FiltersConfiguration, FiltersState } from '@/dtos/Filters'
import { useEffect, useState } from 'react'

/**
 * Hook that creates a data structure for managing item filters and related operations.
 * @param filtersConfiguration Configuration of the filters
 * @returns Data structure for managing item filters and related operations
 */
export default function useFilters(filtersConfiguration: FiltersConfiguration): FiltersState {
    const [filtersMap, setFiltersMap] = useState<FilterStatesMap>({});

    useEffect(() => {
        const map: FilterStatesMap = {};

        Object.keys(filtersConfiguration).forEach((key) => {
            const filter = filtersConfiguration[key];

            map[key] = {
                key: key,
                title: filter.title,
                description: filter.description,
                selectedItems: new Map<any, any>(),
                selectableItems: new Map<any, any>(filter.allSelectableItems),
                allSelectableItems: new Map<any, any>(filter.allSelectableItems),
                itemTitleSelector: filter.itemTitleSelector,
            };
        });

        setFiltersMap(map);
    }, [filtersConfiguration]);

    function switchSelection(filterKey: string, itemKey: any) {
        setFiltersMap((oldMap) => {
            const newMap = {
                ...oldMap
            };
            const filter = newMap[filterKey] = {
                ...newMap[filterKey]
            };

            filter.selectedItems = new Map(filter.selectedItems);

            if (!filter.selectedItems.has(itemKey)) {
                filter.selectedItems.set(itemKey, filter.selectableItems.get(itemKey));
            }
            else {
                filter.selectedItems.delete(itemKey);
            }

            updateSelectableItems(newMap);

            return newMap;
        });
    }

    function clear(filterKey: string) {
        setFiltersMap((oldMap) => {
            const newMap = {
                ...oldMap
            };
            const filter = newMap[filterKey] = {
                ...newMap[filterKey]
            };

            filter.selectedItems = new Map();
            updateSelectableItems(newMap);

            return newMap;
        });
    }

    function updateSelectableItems(map: FilterStatesMap) {
        Object.keys(filtersConfiguration).forEach((key) => {
            const filter = filtersConfiguration[key];
            const state = map[key];

            state.selectableItems = filter.updateSelectableItems(map);
        });
    }

    return {
        filtersMap,
        switchSelection,
        clear
    };
}