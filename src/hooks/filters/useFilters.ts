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

            const selectedItems = new Map<any, any>();

            if (filter.defaultSelectedKeys) {
                for (const key of filter.defaultSelectedKeys) {
                    if (filter.allSelectableItems.has(key)) {
                        selectedItems.set(key, filter.allSelectableItems.get(key));
                    }
                }
            }

            map[key] = {
                key: key,
                title: filter.title,
                description: filter.description,
                enableAndSelection: filter.enableAndSelection,
                useAnd: false,
                selectedItems: selectedItems,
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

    function toggleUseAnd(filterKey: string) {
        setFiltersMap((oldMap) => {
            const newMap = {
                ...oldMap
            };
            const filter = newMap[filterKey] = {
                ...newMap[filterKey]
            };

            filter.useAnd = !filter.useAnd;

            return newMap;
        });
    }

    function updateSelectableItems(map: FilterStatesMap) {
        Object.keys(filtersConfiguration).forEach((key) => {
            const filter = filtersConfiguration[key];
            const state = map[key];

            state.selectableItems = canReturnAllSelectable(map, key) ?
                new Map(state.allSelectableItems) :
                filter.updateSelectableItems(map);
        });
    }

    return {
        filtersMap,
        switchSelection,
        clear,
        toggleUseAnd
    };
}

function canReturnAllSelectable(state: FilterStatesMap, key: string) {
    return Object.keys(state).every((k) => k === key || state[k].selectedItems.size === 0);
}