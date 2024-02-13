import { useEffect, useState } from 'react'

export type Filter = {
    allSelectableItems: Map<any, any>,
    updateSelectableItems: (filtersState: FilterStatesMap) => Map<any, any>,
    itemTitleSelector: (item: any) => any,
}

type FilterState = {
    key: string,
    selectableItems: Map<any, any>,
    selectedItems: Map<any, any>,
    itemTitleSelector: (item: any) => any,
}

export type FilterStatesMap = {
    [key: string]: FilterState
}

export type FiltersState = {
    filtersMap: FilterStatesMap,
    switchSelection: (filterKey: string, itemKey: any) => void,
    clear: (filterKey: string) => void,
}

export default function usePublicationsFilters(filters: { [key: string]: Filter }): FiltersState {
    const [filtersMap, setFiltersMap] = useState<FilterStatesMap>({});

    useEffect(() => {
        const map: FilterStatesMap = {};

        Object.keys(filters).forEach((key) => {
            const filter = filters[key];

            map[key] = {
                key: key,
                selectedItems: new Map<any, any>(),
                selectableItems: new Map<any, any>(filter.allSelectableItems),
                itemTitleSelector: filter.itemTitleSelector,
            };
        });

        setFiltersMap(map);
    }, [filters]);

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
        Object.keys(filters).forEach((key) => {
            const filter = filters[key];
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