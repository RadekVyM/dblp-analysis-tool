import { cn } from '@/utils/tailwindUtils'
import Tabs from '../Tabs'
import DataVisualisationContainer from './DataVisualisationContainer'

type StatsScaffoldParams = {
    items: Array<StatsScaffoldItem>,
    scaffoldId: string,
    sideTabsLegend: string,
    selectedKey: any,
    onKeySelected: (key: any) => void,
    className?: string
}

type StatsScaffoldItem = {
    key: any,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
}

type StatsScaffoldItemMode = {

}

export default function StatsScaffold({ className, items, scaffoldId, sideTabsLegend, onKeySelected, selectedKey }: StatsScaffoldParams) {
    return (
        <div
            className={cn('grid grid-rows-[auto,1fr] sm:grid-cols-[1fr,auto] sm:grid-rows-[1fr] gap-3', className)}>
            <Tabs
                className='self-start flex-wrap sm:flex-col sm:col-start-2 sm:col-end-3'
                tabsId={`${scaffoldId}-side-tabs`}
                legend={sideTabsLegend}
                items={items.map((item) => {
                    return {
                        id: item.key,
                        content: item.icon,
                        title: item.title
                    }
                })}
                selectedId={selectedKey}
                setSelectedId={(id) => onKeySelected(id)} />
            <DataVisualisationContainer
                className='overflow-x-auto sm:row-start-1 sm:row-end-2 sm:col-start-1 sm:col-end-2'>
                {items.find((item) => item.key == selectedKey)?.content}
            </DataVisualisationContainer>
        </div>
    )
}