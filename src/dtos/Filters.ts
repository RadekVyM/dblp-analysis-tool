export type Filter = {
    title: string,
    allSelectableItems: Map<any, any>,
    updateSelectableItems: (filtersState: FilterStatesMap) => Map<any, any>,
    itemTitleSelector: (item: any) => any,
}

export type FiltersConfiguration = { [key: string]: Filter }

export type FilterState = {
    key: string,
    title: string,
    allSelectableItems: Map<any, any>,
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