/** Configuration of an items filter. */
export type Filter = {
    title: string,
    description?: string,
    allSelectableItems: Map<any, any>,
    defaultSelectedKeys?: Array<any>,
    enableAndSelection?: boolean,
    updateSelectableItems: (filtersState: FilterStatesMap) => Map<any, any>,
    itemTitleSelector: (item: any) => any,
}

/** Configuration of some item filters. */
export type FiltersConfiguration = { [key: string]: Filter }

/** State of an items filter. */
export type FilterState = {
    key: string,
    title: string,
    description?: string,
    enableAndSelection?: boolean,
    useAnd: boolean,
    allSelectableItems: Map<any, any>,
    selectableItems: Map<any, any>,
    selectedItems: Map<any, any>,
    itemTitleSelector: (item: any) => any,
}

/** State of an object that manages item filters. */
export type FilterStatesMap = {
    [key: string]: FilterState
}

/** State and operations of an object that manages item filters. */
export type FiltersState = {
    filtersMap: FilterStatesMap,
    switchSelection: (filterKey: string, itemKey: any) => void,
    clear: (filterKey: string) => void,
    toggleUseAnd: (filterKey: string) => void,
}